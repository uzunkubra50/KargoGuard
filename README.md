<div align="center">

<p><a href="./README.md">🇬🇧 English</a> &nbsp;|&nbsp; <a href="./README.tr.md">🇹🇷 Türkçe</a></p>

<img src="https://img.shields.io/badge/KargoGuard-AI%20Cargo%20Security-002E6D?style=for-the-badge&logo=shield&logoColor=white" alt="KargoGuard" height="40"/>

<br/>
<br/>

**AI-powered cargo damage detection platform with blockchain-verified proof of condition.**  
*Real-time analysis · Immutable records · Multi-role access*

<br/>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-kargo--guard.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://kargo-guard.vercel.app)

<br/>

![.NET](https://img.shields.io/badge/.NET_10-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.10-3776AB?style=flat-square&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Ethereum](https://img.shields.io/badge/Ethereum_Sepolia-3C3C3D?style=flat-square&logo=ethereum&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=flat-square&logo=rabbitmq&logoColor=white)
![Redis](https://img.shields.io/badge/Redis_7-DC382D?style=flat-square&logo=redis&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## Overview

KargoGuard combines computer vision, IoT sensor data, and blockchain technology to eliminate disputes in cargo logistics. Every package is analyzed at pickup and delivery — damage is detected automatically, liability is determined instantly, and the result is written immutably to Ethereum.

| Without KargoGuard | With KargoGuard |
|---|---|
| Manual damage inspection | AI analysis in seconds |
| He-said-she-said disputes | Blockchain-verified proof |
| Paper trail gets lost | Permanent on-chain record |
| Delayed liability decisions | Instant automated verdict |

---

## Features

**AI Damage Detection**  
YOLOv8 object detection paired with Google Gemini vision analysis classifies damage type, severity, and location from a single photo.

**Blockchain Audit Trail**  
Every analysis result is hashed and recorded on Ethereum Sepolia via a Solidity smart contract. Records are publicly verifiable on Etherscan — no one can alter them after the fact.

**Asynchronous Processing Pipeline**  
C# API publishes jobs to RabbitMQ. Python AI worker consumes and processes them independently, enabling the system to handle high volume without blocking the API.

**Multi-Role Access**  
Three distinct roles — Admin (full dashboard), Courier (field operations via mobile), Customer (self-service cargo tracking) — each with scoped JWT permissions.

**IoT Sensor Integration**  
G-Force sensor data captured at the moment of impact is stored alongside the photo analysis, providing physical evidence to complement the visual record.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  React Dashboard (:5173)          React Native Mobile App   │
└────────────────────┬────────────────────────────────────────┘
                     │ REST + JWT
┌────────────────────▼────────────────────────────────────────┐
│                    KargoGuard.API  (:5229)                   │
│              C# .NET 10  ·  Dapper  ·  Swagger              │
└──────┬────────────────────────────────────┬─────────────────┘
       │ AMQP                               │ SQL / S3
┌──────▼──────────┐              ┌──────────▼──────────────────┐
│  KargoGuard.AI  │              │  PostgreSQL  │  MinIO        │
│  Python Worker  │              │  (records)   │  (images)     │
│  YOLOv8 + Gemini│              └─────────────────────────────┘
└──────┬──────────┘
       │ JSON-RPC
┌──────▼──────────┐
│    Ethereum     │
│  Sepolia Testnet│
│  Smart Contract │
└─────────────────┘
```

| Layer | Technology |
|---|---|
| Backend API | C# .NET 10, Dapper, JWT Bearer, Swashbuckle, API Versioning |
| AI Worker | Python 3.10, YOLOv8, Roboflow, Google Gemini 2.5 Flash |
| Frontend | React 18, Vite, TailwindCSS, Recharts — deployed on Vercel |
| Mobile | React Native, Expo |
| Message Queue | RabbitMQ 3 |
| Database | PostgreSQL 15 |
| Object Storage | MinIO (S3-compatible) |
| Cache / Security | Redis 7 — token blacklist, rate limiting |
| Blockchain | Solidity, Hardhat, Nethereum, Ethereum Sepolia |
| Infrastructure | Docker Compose, ngrok (tunnel) |

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — running
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)

### Quick Start (Windows)

```bash
start-all.bat
```

This script starts all four services in order: Docker infrastructure → .NET API → Python AI worker → React dashboard.

### Manual Start

Run each step in a separate terminal window.

**1. Infrastructure**
```bash
docker-compose up -d
```

**2. API**
```bash
cd backend/KargoGuard.API
dotnet run
```

**3. AI Worker**
```bash
cd backend/KargoGuard.AI
venv\Scripts\python.exe consumer.py
```
> First time: `python -m venv venv && venv\Scripts\pip install -r requirements.txt`

**4. Dashboard**
```bash
cd frontend
npm install && npm run dev
```

Once all services are up, open **http://localhost:5173** or visit the live deployment at **https://kargo-guard.vercel.app**.

### Mobile Setup

The mobile app reads the API URL from an environment variable. Copy the example file and set your address:

```bash
cp mobile/.env.example mobile/.env
# Edit mobile/.env — set EXPO_PUBLIC_API_URL
```

For demos, expose the local API with ngrok:

```bash
ngrok http --domain=mycologic-overdistantly-iva.ngrok-free.dev 5229
```

The static domain never changes — `mobile/.env` stays set to `https://mycologic-overdistantly-iva.ngrok-free.dev` permanently.

---

## Project Structure

```
KargoGuard/
├── backend/
│   ├── KargoGuard.API/          # C# .NET Web API
│   │   ├── Controllers/         # AuthController, CargoController
│   │   ├── Services/            # Auth, Blockchain, MinIO, RabbitMQ, TokenBlacklist
│   │   └── Models/
│   └── KargoGuard.AI/           # Python AI worker
│       ├── consumer.py          # RabbitMQ consumer + inference pipeline
│       └── yolov8n.pt           # YOLOv8 model weights
├── frontend/                    # React dashboard (deployed on Vercel)
│   ├── .env.example             # VITE_API_URL template
│   └── src/
│       ├── App.jsx              # Auth + role routing
│       └── CargoDashboard.jsx   # Admin panel
├── mobile/                      # React Native app (Expo)
│   ├── .env.example             # EXPO_PUBLIC_API_URL template
│   └── config.js                # Reads API URL from env
├── web3/                        # Solidity smart contract + Hardhat
│   └── contracts/CargoGuard.sol
└── docker-compose.yml           # PostgreSQL · RabbitMQ · MinIO · Redis
```

---

<div align="center">
  <sub>Built by <a href="https://github.com/uzunkubra50"><b>Kübra Uzun</b></a></sub>
</div>
