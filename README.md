# ⚡ NSO Core — Ninja School Online Modding Framework

A lightweight, automated bytecode-injection modding environment for Ninja School Online J2ME (`NinjaSchool_217w.jar`).

## 📁 Repository Structure

```
nsocore/
├── build.sh                  # One-click build & patch script
├── input/
│   └── NinjaSchool_217w.jar  # Clean original J2ME JAR file
├── lib/                      # Build tools & API stubs
│   ├── javassist.jar         # Bytecode manipulation engine
│   ├── ecj.jar               # Eclipse Java Compiler
│   ├── midpapi20.jar         # J2ME MIDP 2.0 API stubs
│   └── cldcapi11.jar         # J2ME CLDC 1.1 API stubs
├── src/
│   ├── mod/
│   │   └── MatrixMod.java    # Mod logic, UI overlays, speed hack, auto farm
│   └── patcher/
│       └── Patcher.java      # Javassist bytecode instrumenter
└── dist/
    └── NinjaSchool_217w_MatrixMOD.jar # Output runnable game JAR
```

## 🚀 How to Build

Run the automated build script from the `nsocore` directory:

```bash
./build.sh
```

The compiled and patched game JAR will be generated in `dist/NinjaSchool_217w_MatrixMOD.jar`.

## 🛠 Adding New Features

1. **Adding Mod Logic & UI:** Edit `src/mod/MatrixMod.java`.
2. **Adding Bytecode Hooks:** Edit `src/patcher/Patcher.java` to inject hooks into obfuscated game classes (`dg.class`, `main/a.class`, `bp.class`, etc.).
3. Run `./build.sh` to compile and repack!
