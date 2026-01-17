import { NextRequest, NextResponse } from "next/server";
import { deleteClinic, getClinicById, updateClinic } from "@/lib/clinics";
import type { ClinicUpdate } from "@/types/clinic";

/**
 * DELETE /api/clinics/[id]
 * Elimina una clínica por su ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de clínica es requerido" },
        { status: 400 }
      );
    }

    // Verificar que la clínica existe
    const clinic = await getClinicById(id);
    if (!clinic) {
      return NextResponse.json(
        { error: "Clínica no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la clínica
    await deleteClinic(id);

    return NextResponse.json(
      { message: "Clínica eliminada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * PUT /api/clinics/[id]
 * Actualiza una clínica por su ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de clínica es requerido" },
        { status: 400 }
      );
    }

    // Verificar que la clínica existe
    const clinic = await getClinicById(id);
    if (!clinic) {
      return NextResponse.json(
        { error: "Clínica no encontrada" },
        { status: 404 }
      );
    }

    const body: ClinicUpdate = await request.json();

    // Validar que el nombre sea requerido si se proporciona
    if (body.name !== undefined && (!body.name || body.name.trim() === "")) {
      return NextResponse.json(
        { error: "El nombre de la clínica es requerido" },
        { status: 400 }
      );
    }

    // Validar email si se proporciona
    if (body.email && body.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: "El email no es válido" },
          { status: 400 }
        );
      }
    }

    // Validar URL del website si se proporciona
    if (body.website && body.website.trim() !== "") {
      try {
        new URL(body.website);
      } catch {
        return NextResponse.json(
          { error: "La URL del sitio web no es válida" },
          { status: 400 }
        );
      }
    }

    // Actualizar la clínica
    const updatedClinic = await updateClinic(id, body);

    return NextResponse.json({ clinic: updatedClinic }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
