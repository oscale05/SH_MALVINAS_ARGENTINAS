import subprocess, time, os, sys
from playwright.sync_api import sync_playwright

BACKEND = "/Users/slm/Proyectos/Comerciales/Sistema Hacienda/backend"
FRONTEND_DIST = "/Users/slm/Proyectos/Comerciales/Sistema Hacienda/frontend/dist/frontend/browser"

# Start backend
backend = subprocess.Popen(
    ["php", "-S", "127.0.0.1:8099", "-t", "public"],
    cwd=BACKEND, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
)
# Start frontend static server with SPA fallback
import http.server, socketserver
class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            self.path = '/index.html'
        super().do_GET()
os.chdir(FRONTEND_DIST)
httpd = socketserver.TCPServer(("", 4202), SPAHandler)
import threading
threading.Thread(target=httpd.serve_forever, daemon=True).start()

time.sleep(3)

results = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Test 1: Login page renders
        page.goto("http://127.0.0.1:4202/login")
        page.wait_for_timeout(2000)
        assert page.locator('input[placeholder="usuario"]').count() > 0, "Login input not found"
        results.append("PASS: Login page renders")

        # Test 2: Login with valid credentials
        page.fill('input[placeholder="usuario"]', 'operador')
        page.fill('input[placeholder="clave"]', 'operador123')
        page.click('button:has-text("Entrar")')
        page.wait_for_timeout(3000)
        results.append("PASS: Login submitted")

        # Test 3: Dashboard loads
        page.wait_for_timeout(3000)
        content = page.content()
        assert "Dashboard" in content, "Dashboard not rendered"
        results.append("PASS: Dashboard rendered")

        # Test 4: Dashboard shows data
        assert "Filas:" in page.content(), "Dashboard data not loaded"
        results.append("PASS: Dashboard data loaded")

        # Test 5: Charts rendered
        assert page.locator('svg').count() > 0, "No charts rendered"
        results.append("PASS: Charts rendered")

        browser.close()
    print("\n".join(results))
    print("\nE2E ALL PASSED")
except Exception as e:
    print(f"E2E FAILED: {e}")
    sys.exit(1)
finally:
    backend.kill()
    httpd.shutdown()
