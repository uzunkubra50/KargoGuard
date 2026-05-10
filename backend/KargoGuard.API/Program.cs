using KargoGuard.API.Services;

var builder = WebApplication.CreateBuilder(args);

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

// 1. KargoGuard Servisleri
builder.Services.AddControllers();
builder.Services.AddSingleton<IDatabaseInitializer, DatabaseInitializer>();
builder.Services.AddScoped<IMinioService, MinioService>();
builder.Services.AddSingleton<IRabbitMQPublisher, RabbitMQPublisher>();
builder.Services.AddSingleton<IBlockchainService, BlockchainService>();

// 2. Swagger Servisleri (Test ekranı için şart)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbInitializer = scope.ServiceProvider.GetRequiredService<IDatabaseInitializer>();
    await dbInitializer.InitializeAsync();
}

// CORS'u aktif et (Routing/Controller'dan önce)
app.UseCors("AllowFrontend");

// 3. Swagger Arayüzünü Aktif Etme
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
