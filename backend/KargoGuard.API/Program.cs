using System.Text;
using Asp.Versioning;
using KargoGuard.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);

// .env dosyasından Gemini key'ini yükle — Python worker ile aynı kaynak
// appsettings.Development.json'daki değeri override eder, senkron sorunu ortadan kalkar
var envFilePath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "KargoGuard.AI", ".env"));
if (File.Exists(envFilePath))
{
    foreach (var line in File.ReadAllLines(envFilePath))
    {
        var t = line.Trim();
        if (t.StartsWith('#') || !t.Contains('=')) continue;
        var sep = t.IndexOf('=');
        Environment.SetEnvironmentVariable(t[..sep].Trim(), t[(sep + 1)..].Trim());
    }
    var envGeminiKey   = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
    var envGeminiModel = Environment.GetEnvironmentVariable("GEMINI_MODEL");
    if (!string.IsNullOrEmpty(envGeminiKey))   builder.Configuration["Gemini:ApiKey"] = envGeminiKey;
    if (!string.IsNullOrEmpty(envGeminiModel)) builder.Configuration["Gemini:Model"]  = envGeminiModel;
}

// CORS Politikası (Frontend React için)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// JWT Kimlik Doğrulama
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew                = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// API Versiyonlama
builder.Services.AddApiVersioning(opt =>
{
    opt.DefaultApiVersion                = new ApiVersion(1, 0);
    opt.AssumeDefaultVersionWhenUnspecified = true;
    opt.ReportApiVersions                = true;
    opt.ApiVersionReader                 = new UrlSegmentApiVersionReader();
}).AddApiExplorer(opt =>
{
    opt.GroupNameFormat           = "'v'VVV";
    opt.SubstituteApiVersionInUrl = true;
});

// KargoGuard Servisleri
builder.Services.AddControllers();
builder.Services.AddSingleton<IDatabaseInitializer, DatabaseInitializer>();
builder.Services.AddScoped<IMinioService, MinioService>();
builder.Services.AddSingleton<IRabbitMQPublisher, RabbitMQPublisher>();
builder.Services.AddSingleton<IBlockchainService, BlockchainService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "KargoGuard API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "JWT token'ınızı girin."
    });
    c.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", doc),
            new List<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbInitializer = scope.ServiceProvider.GetRequiredService<IDatabaseInitializer>();
    await dbInitializer.InitializeAsync();
}

// CORS'u aktif et (Routing/Controller'dan önce)
app.UseCors("AllowFrontend");

// Prometheus — HTTP istek metriklerini kaydet (auth'tan önce ki tüm istekler yakalanır)
app.UseHttpMetrics();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "KargoGuard API v1");
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapMetrics("/metrics");   // Prometheus scrape endpoint — auth gerektirmez

app.Run();
