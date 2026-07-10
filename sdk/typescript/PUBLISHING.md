# Publicar `@falconext/logistica` en npm

> Ejecuta estos comandos en TU terminal (necesitan tu login + código 2FA).

## Prerrequisitos (una sola vez)
1. **Activa 2FA** en tu cuenta npm (Account → Two-Factor Authentication). npm lo exige para publicar.
2. **Crea la organización gratuita** `falconext` (necesaria para el scope `@falconext`):
   → https://www.npmjs.com/org/create → nombre `falconext` → plan **Free** (paquetes públicos).

## Publicar
```bash
npm login                      # abre el navegador; ya estás logueado → autoriza
cd sdk/typescript
npm publish --access public    # compila dist/ (prepublishOnly) y publica; pide OTP 2FA
```

Verifica:
```bash
npm view @falconext/logistica
npm install @falconext/logistica   # pruébalo en otro proyecto
```

## Publicar una nueva versión (más adelante)
```bash
npm version patch     # 0.1.0 → 0.1.1  (o minor / major)
npm publish --access public
```
> Las versiones son **inmutables**: no puedes re-publicar la misma versión, siempre sube el número.

## Qué se sube
Solo `dist/` (JS + tipos) y `README.md` (ver campo `files` en package.json). El `src/`, `node_modules/` y configs NO se publican.
