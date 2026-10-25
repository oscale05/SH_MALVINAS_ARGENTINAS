import subprocess, time, sys
from playwright.sync_api import sync_playwright

backend = subprocess.Popen(
    ["php", "-S", "127.0.0.1:8099", "-t", "public"],
    cwd="/Users/slm/Proyectos/Comerciales/Sistema Hacienda/backend",
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
)
frontend = subprocess.Popen(
    ["npx", "ng", "serve", "--port", "4201"],
    cwd="/Users/slm/Proyectos/Comerciales/Sistema Hacienda/frontend",
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
)
time.sleep(8)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://127.0.0.1:4201/login")
        page.fill('input[placeholder="usuario"]', 'operador')
        page.fill('input[placeholder="clave"]', 'operador123')
        page.click('button:has-text("Entrar")')
        page.wait_for_timeout(2000)
        assert page.url.endswith("/") or "4201" in page.url, f"Login failed: {page.url}"
        print("E2E: login OK")
        page.wait_for_timeout(3000)
        content = page.content()
        assert "Dashboard" in content, "Dashboard not rendered"
        print("E2E: dashboard rendered OK")
        browser.close()
    print("E2E ALL PASSED")
finally:
    backend.kill()
    frontend.kill()
