<?php
declare(strict_types=1);

namespace App;

final class Auth
{
    public static function login(string $username, string $password): ?string
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('SELECT username, password_hash, role FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, (string) $user['password_hash'])) {
            return null;
        }
        $header = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
        $payload = self::base64UrlEncode(json_encode([
            'sub' => $user['username'],
            'role' => $user['role'],
            'iat' => time(),
        ], JSON_THROW_ON_ERROR));
        $signature = self::base64UrlEncode(hash_hmac('sha256', $header . '.' . $payload, self::secret(), true));
        return $header . '.' . $payload . '.' . $signature;
    }

    public static function verify(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        [$header, $payload, $signature] = $parts;
        $expected = self::base64UrlEncode(hash_hmac('sha256', $header . '.' . $payload, self::secret(), true));
        if (!hash_equals($expected, $signature)) {
            return null;
        }
        $data = json_decode(self::base64UrlDecode($payload), true);
        return is_array($data) ? $data : null;
    }

    private static function secret(): string
    {
        return Config::get('JWT_SECRET', 'change-me-in-production') ?? 'change-me-in-production';
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string
    {
        $padding = 4 - (strlen($value) % 4);
        if ($padding < 4) {
            $value .= str_repeat('=', $padding);
        }
        return base64_decode(strtr($value, '-_', '+/')) ?: '';
    }
}
