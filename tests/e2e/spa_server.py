import http.server, socketserver, os

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            self.path = '/index.html'
        super().do_GET()

os.chdir("/Users/slm/Proyectos/Comerciales/Sistema Hacienda/frontend/dist/frontend/browser")
with socketserver.TCPServer(("", 4201), SPAHandler) as httpd:
    httpd.serve_forever()
