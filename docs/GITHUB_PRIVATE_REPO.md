# GitHub Private Repository Procedure

Fecha de corte: 2026-04-28

## Estado Actual

El remoto debe apuntar al repositorio privado acordado para el proyecto.

```text
origin https://github.com/<owner>/<repo>.git
```

Comando de verificacion:

```powershell
gh repo view <owner>/<repo> --json nameWithOwner,visibility,isPrivate,url
```

Resultado esperado:

```json
{"isPrivate":true,"nameWithOwner":"<owner>/<repo>","url":"https://github.com/<owner>/<repo>","visibility":"PRIVATE"}
```

## Regla De Seguridad

No hacer push si el repositorio no confirma `isPrivate: true`.

No commitear:
- `.env`
- `.env.local`
- `.env.*.local`
- logs
- `artifacts/`
- builds
- dumps
- credenciales
- tokens
- capturas temporales
- notas locales, prompts historicos o materiales de trabajo no finales

## Checklist Antes De Subir

1. Confirmar privacidad del remoto:

```powershell
gh repo view <owner>/<repo> --json visibility,isPrivate
```

2. Revisar archivos pendientes:

```powershell
git status --short
```

3. Revisar secretos obvios:

```powershell
git diff --cached
git diff -- . ":(exclude)package-lock.json"
```

4. Ejecutar checks razonables:

```powershell
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

5. Confirmar que `CHANGELOG.md`, `package.json` y `package-lock.json` reflejan la iteracion.

6. Confirmar que no quedan terminos no publicables en archivos que vayan a subirse:

```powershell
# Mantener la lista de terminos fuera del repo, por ejemplo en:
# tmp/ip-risk-terms.txt
Get-Content tmp/ip-risk-terms.txt | ForEach-Object {
  rg -n -i --fixed-strings $_ README.md PRODUCT.md DESIGN.md docs app components data features lib tests public
}
```

## Si Hay Que Limpiar Historial Ya Subido

Un commit remoto puede contener archivos que despues decidimos excluir. Borrar o ignorar archivos en un commit nuevo no elimina su rastro del historial.

Para eliminarlo de verdad hay que reescribir `main` y hacer push forzado con lease. No hacerlo sin confirmacion explicita porque cambia la historia remota:

```powershell
# Solo tras confirmar que el repo es privado y que nadie depende del historial actual.
git checkout --orphan clean-main
git add <solo archivos aprobados>
git commit -m "chore: clean private alpha baseline"
git branch -M main
git push --force-with-lease origin main
```

## Publicacion

Cuando se quiera subir:

```powershell
git add <archivos revisados>
git commit -m "chore: prepare alpha baseline"
git push origin main
```

Si se prefiere trabajar por PR:

```powershell
git checkout -b release/alpha-baseline
git add <archivos revisados>
git commit -m "chore: prepare alpha baseline"
git push -u origin release/alpha-baseline
gh pr create --draft --title "Alpha baseline" --body "Private alpha baseline."
```
