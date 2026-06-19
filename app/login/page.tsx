'use client';

import React, { useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username.trim(), password);
    if (!success) {
      setError('Usuario o contraseña incorrectos');
      return;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light-gray flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-neutral-dark mb-6">Iniciar sesión</h1>
        <p className="text-sm text-neutral-medium-gray mb-6">
          Accede con tus credenciales de gerente o jefe.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-dark mb-2">Usuario</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="gerente o jefe"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-dark mb-2">Contraseña</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
            />
          </div>

          {error && <p className="text-status-error text-sm">{error}</p>}

          <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">
            Entrar
          </Button>
        </form>
      </Card>
    </div>
  );
}
