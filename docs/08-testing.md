# Testing

Unitarios:
- Parser Excel Major (test_xlsx_parser.php)
- Auth (test_auth.php)
- Health (test_health.php)
- Summary (test_summary.php)
- Macro (test_macro.php)
- Completo (test_completo.php)

Integración:
- 18 endpoints (test_all_endpoints.php)
- Flujo completo (test_integration.php)

E2E:
- Login + Dashboard (Playwright)

Frontend:
- App creation (app.spec.ts)
- ApiService creation (api.service.spec.ts)

CI:
- GitHub Actions con MariaDB
- PHPUnit no disponible (composer bloqueado por red)
- Lint PHP + build Angular + tests
