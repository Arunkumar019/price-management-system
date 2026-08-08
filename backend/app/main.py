from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal
from app import models
from app.utils.security import get_password_hash
from app.api import auth, components, configurations, dashboard

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Laptop Configuration & Pricing Management System",
    description="Production-Ready API for Laptop Pricing, Custom Builder & Snapshot History Management",
    version="1.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_database_defaults():
    db: Session = SessionLocal()
    try:
        # 1. Create Default Admin User if not present
        admin_user = db.query(models.User).filter(models.User.email == "admin@gmail.com").first()
        if not admin_user:
            admin_user = models.User(
                email="admin@gmail.com",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("✓ Created default admin user: admin@gmail.com / admin123")

        # 2. Seed Realistic Components across all 8 required categories if empty
        existing_components_count = db.query(models.Component).count()
        if existing_components_count == 0:
            sample_components = [
                # Processor
                {"name": "Intel Core i5-13500H", "category": "Processor", "brand": "Intel", "price": 220.00, "description": "12 Cores, up to 4.7GHz Turbo, 18MB Cache"},
                {"name": "Intel Core i7-13700H", "category": "Processor", "brand": "Intel", "price": 340.00, "description": "14 Cores, up to 5.0GHz Turbo, 24MB Cache"},
                {"name": "Intel Core i9-13900HX", "category": "Processor", "brand": "Intel", "price": 520.00, "description": "24 Cores Extreme Performance Laptop CPU"},
                {"name": "AMD Ryzen 7 7840HS", "category": "Processor", "brand": "AMD", "price": 310.00, "description": "8 Cores, 16 Threads, Zen 4 Architecture"},
                {"name": "AMD Ryzen 9 7945HX", "category": "Processor", "brand": "AMD", "price": 500.00, "description": "16 Cores High Performance Mobile Processor"},

                # RAM
                {"name": "16GB DDR5 4800MHz (1x16GB)", "category": "RAM", "brand": "Crucial", "price": 55.00, "description": "High speed DDR5 laptop RAM SODIMM"},
                {"name": "32GB DDR5 5600MHz (2x16GB)", "category": "RAM", "brand": "Corsair", "price": 120.00, "description": "Dual channel high performance memory kit"},
                {"name": "64GB DDR5 5600MHz (2x32GB)", "category": "RAM", "brand": "Kingston", "price": 240.00, "description": "Extreme capacity workstation memory"},

                # Storage
                {"name": "512GB PCIe 4.0 NVMe M.2 SSD", "category": "Storage", "brand": "Samsung", "price": 45.00, "description": "Fast boot storage up to 5000 MB/s"},
                {"name": "1TB PCIe 4.0 NVMe M.2 SSD", "category": "Storage", "brand": "Samsung", "price": 85.00, "description": "Ultra fast read speeds up to 7000 MB/s"},
                {"name": "2TB PCIe 4.0 NVMe M.2 SSD", "category": "Storage", "brand": "WD Black", "price": 160.00, "description": "High performance gaming and creative storage"},

                # Graphics Card
                {"name": "NVIDIA GeForce RTX 4050 6GB", "category": "Graphics Card", "brand": "NVIDIA", "price": 280.00, "description": "Entry-level ray tracing laptop GPU"},
                {"name": "NVIDIA GeForce RTX 4060 8GB", "category": "Graphics Card", "brand": "NVIDIA", "price": 420.00, "description": "Popular sweet-spot 1440p gaming GPU"},
                {"name": "NVIDIA GeForce RTX 4080 12GB", "category": "Graphics Card", "brand": "NVIDIA", "price": 850.00, "description": "High-end enthusiast laptop GPU"},
                {"name": "AMD Radeon RX 7600M XT 8GB", "category": "Graphics Card", "brand": "AMD", "price": 380.00, "description": "RDNA 3 architecture gaming GPU"},

                # Display
                {"name": "15.6\" FHD (1920x1080) 144Hz IPS", "category": "Display", "brand": "LG", "price": 110.00, "description": "Smooth refresh rate display for daily use"},
                {"name": "16.0\" QHD+ (2560x1600) 240Hz IPS", "category": "Display", "brand": "BOE", "price": 190.00, "description": "Vibrant colors 100% DCI-P3 display"},
                {"name": "16.0\" 4K UHD+ (3840x2400) OLED 120Hz", "category": "Display", "brand": "Samsung", "price": 320.00, "description": "Professional color accurate OLED display"},

                # Battery
                {"name": "60Wh 4-cell Li-ion Battery", "category": "Battery", "brand": "OEM", "price": 40.00, "description": "Standard battery for light laptops"},
                {"name": "80Wh 4-cell Fast Charge Battery", "category": "Battery", "brand": "OEM", "price": 65.00, "description": "Long lasting fast charge battery"},
                {"name": "99.9Wh 6-cell Maximum Capacity Battery", "category": "Battery", "brand": "OEM", "price": 95.00, "description": "Maximum TSA-allowed battery capacity"},

                # Keyboard
                {"name": "Standard Backlit Chiclet Keyboard", "category": "Keyboard", "brand": "OEM", "price": 25.00, "description": "White LED backlit keyboard with numeric pad"},
                {"name": "Per-Key RGB Mechanical Keyboard (Cherry MX)", "category": "Keyboard", "brand": "Cherry", "price": 85.00, "description": "Tactile clicky mechanical switches with RGB lighting"},

                # Operating System
                {"name": "FreeDOS / No OS", "category": "Operating System", "brand": "Open Source", "price": 0.00, "description": "No pre-installed operating system"},
                {"name": "Windows 11 Home 64-bit", "category": "Operating System", "brand": "Microsoft", "price": 100.00, "description": "Standard home operating system"},
                {"name": "Windows 11 Pro 64-bit", "category": "Operating System", "brand": "Microsoft", "price": 150.00, "description": "Professional edition with BitLocker and Remote Desktop"}
            ]

            for item in sample_components:
                comp = models.Component(**item)
                db.add(comp)
            db.commit()
            print(f"✓ Seeded {len(sample_components)} default components across 8 categories.")

    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    seed_database_defaults()

# Include Routers under both /api/... and direct path for full compatibility
app.include_router(auth.router, prefix="/api")
app.include_router(auth.router)

app.include_router(components.router, prefix="/api")
app.include_router(components.router)

app.include_router(configurations.router, prefix="/api")
app.include_router(configurations.router)

app.include_router(dashboard.router, prefix="/api")
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "Laptop Configuration & Pricing Management System API",
        "docs": "/docs"
    }
