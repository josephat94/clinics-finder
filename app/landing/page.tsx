'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="hub-shell font-body min-h-screen">
      <section className="relative overflow-hidden px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="font-heading text-5xl font-bold tracking-tight text-hub-fg sm:text-6xl lg:text-7xl">
              Encuentra la{' '}
              <span className="text-hub-accent">
                clínica perfecta
              </span>{' '}
              cerca de ti
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-hub-muted sm:text-xl">
              Busca clínicas por ubicación, calcula distancias y tiempos de viaje en tiempo real. 
              La forma más rápida y sencilla de encontrar atención médica cerca de ti.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/clinics">
                <Button size="lg" variant="primary" className="text-lg px-8">
                  Buscar Clínicas
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-hub-fg sm:text-4xl">
              Características principales
            </h2>
            <p className="mt-4 text-lg text-hub-muted">
              Todo lo que necesitas para encontrar la clínica ideal
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="glass-card glass-card-hover p-8">
              <div className="mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef3c7]">
                  <svg
                    className="h-6 w-6 text-hub-fg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-hub-fg mb-2">
                Búsqueda por Ubicación
              </h3>
              <p className="text-hub-muted">
                Ingresa tu dirección o ciudad y encuentra las clínicas más cercanas. 
                Utilizamos geocodificación avanzada para resultados precisos.
              </p>
            </Card>

            <Card className="glass-card glass-card-hover p-8">
              <div className="mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dbeafe]">
                  <svg
                    className="h-6 w-6 text-hub-fg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-hub-fg mb-2">
                Tiempos de Viaje en Tiempo Real
              </h3>
              <p className="text-hub-muted">
                Calcula distancias y tiempos de viaje precisos usando Google Maps API. 
                Obtén información actualizada sobre cuánto tardarás en llegar.
              </p>
            </Card>

            <Card className="glass-card glass-card-hover p-8">
              <div className="mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef3c7]">
                  <svg
                    className="h-6 w-6 text-hub-fg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-hub-fg mb-2">
                Filtros Avanzados
              </h3>
              <p className="text-hub-muted">
                Filtra clínicas por estado, busca por nombre y ordena por distancia. 
                Encuentra exactamente lo que necesitas con nuestros filtros inteligentes.
              </p>
            </Card>

            <Card className="glass-card glass-card-hover p-8">
              <div className="mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dbeafe]">
                  <svg
                    className="h-6 w-6 text-hub-fg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-hub-fg mb-2">
                Información Detallada
              </h3>
              <p className="text-hub-muted">
                Accede a información completa de cada clínica: dirección, teléfono, 
                email y ubicación exacta. Todo en un solo lugar.
              </p>
            </Card>

            <Card className="glass-card glass-card-hover p-8">
              <div className="mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef3c7]">
                  <svg
                    className="h-6 w-6 text-hub-fg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-hub-fg mb-2">
                Gestión de Usuarios
              </h3>
              <p className="text-hub-muted">
                Sistema de autenticación seguro con roles de administrador. 
                Los administradores pueden gestionar clínicas y usuarios fácilmente.
              </p>
            </Card>

            <Card className="glass-card glass-card-hover p-8">
              <div className="mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dbeafe]">
                  <svg
                    className="h-6 w-6 text-hub-fg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-hub-fg mb-2">
                Resultados Rápidos
              </h3>
              <p className="text-hub-muted">
                Algoritmo Haversine para cálculos de distancia ultra rápidos. 
                Obtén resultados instantáneos ordenados por proximidad.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-hub-fg sm:text-4xl">
              ¿Cómo funciona?
            </h2>
            <p className="mt-4 text-lg text-hub-muted">
              Encuentra tu clínica en tres simples pasos
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="glass-card mx-auto flex h-16 w-16 items-center justify-center rounded-full text-hub-fg text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-hub-fg mb-2">
                Ingresa tu ubicación
              </h3>
              <p className="text-hub-muted">
                Escribe tu dirección o ciudad en el buscador. 
                Nuestro sistema geocodificará tu ubicación automáticamente.
              </p>
            </div>

            <div className="text-center">
              <div className="glass-card mx-auto flex h-16 w-16 items-center justify-center rounded-full text-hub-fg text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-hub-fg mb-2">
                Filtra y busca
              </h3>
              <p className="text-hub-muted">
                Usa los filtros por estado o busca por nombre de clínica. 
                Las opciones se actualizan en tiempo real.
              </p>
            </div>

            <div className="text-center">
              <div className="glass-card mx-auto flex h-16 w-16 items-center justify-center rounded-full text-hub-fg text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-hub-fg mb-2">
                Encuentra y contacta
              </h3>
              <p className="text-hub-muted">
                Revisa las clínicas ordenadas por distancia, ve tiempos de viaje 
                y contacta directamente con la información proporcionada.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Card className="p-12 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-hub-fg sm:text-4xl mb-4">
              ¿Listo para encontrar tu clínica?
            </h2>
            <p className="text-lg text-hub-muted mb-8">
              Comienza a buscar ahora y encuentra la atención médica que necesitas
            </p>
            <Link href="/clinics">
              <Button size="lg" variant="primary" className="text-lg px-8">
                Buscar Clínicas Ahora
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
