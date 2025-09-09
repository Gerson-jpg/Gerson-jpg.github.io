# Implementación Segura de Google Sign-In

## 🔒 Seguridad Implementada

Esta implementación sigue las mejores prácticas de seguridad para Google OAuth 2.0:

### ✅ Lo que hace correctamente:
- **Verificación del servidor**: El ID Token se envía al servidor para verificación
- **No confía en datos del cliente**: Los datos del usuario solo se usan después de verificación
- **Usa biblioteca oficial**: El servidor usa `google-auth-library` para verificar tokens
- **Validación de audience**: Verifica que el token sea para tu aplicación específica

### ❌ Lo que evita:
- Decodificación del JWT en el cliente
- Uso de datos no verificados
- Manipulación de tokens por parte del usuario

## 📁 Archivos

### `script.js`
Contiene la función `handleCredentialResponse` que:
1. Recibe la respuesta de Google con el ID Token
2. Envía el token al servidor para verificación
3. Solo procesa los datos después de confirmación del servidor
4. Maneja errores de manera segura

### `server-example.js`
Ejemplo de servidor Node.js/Express que:
1. Recibe el ID Token del cliente
2. Lo verifica usando la biblioteca oficial de Google
3. Retorna los datos verificados del usuario

## 🚀 Cómo usar

### 1. Instalar dependencias del servidor:
```bash
npm install express google-auth-library cors
```

### 2. Ejecutar el servidor:
```bash
node server-example.js
```

### 3. El cliente automáticamente:
- Envía el token a `/api/auth/verify-google-token`
- Espera la respuesta verificada
- Procesa la autenticación solo si es exitosa

## 🔧 Configuración del Servidor

### Endpoint esperado:
```
POST /api/auth/verify-google-token
```

### Request Body:
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

### Response Exitosa:
```json
{
  "success": true,
  "user": {
    "sub": "123456789",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "picture": "https://...",
    "email_verified": true
  }
}
```

### Response de Error:
```json
{
  "success": false,
  "error": "Token inválido o expirado"
}
```

## ⚠️ Modo Desarrollo

Para testing local, puedes descomentar el código de fallback en `script.js` (líneas comentadas), pero **NUNCA uses esto en producción**.

## 🔐 Variables de Entorno Recomendadas

```bash
GOOGLE_CLIENT_ID=tu_client_id_aqui
PORT=3000
NODE_ENV=production
```

## 📚 Recursos Adicionales

- [Documentación oficial de Google Sign-In](https://developers.google.com/identity/sign-in/web/sign-in)
- [Verificación de ID Tokens](https://developers.google.com/identity/sign-in/web/backend-auth)
- [Biblioteca google-auth-library](https://www.npmjs.com/package/google-auth-library)
