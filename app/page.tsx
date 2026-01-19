import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import ClinicsPage from "./clinics/page";
import LandingPage from "./landing/page";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay sesión, mostrar la landing page
  if (!user) {
    return <LandingPage />;
  }

  // Si hay sesión, mostrar la página de clínicas
  return <ClinicsPage />;
}
