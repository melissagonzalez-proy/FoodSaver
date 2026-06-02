import { Leaf, HeartHandshake, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const SelectionRolePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-brand-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-10">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <Leaf size={36} className="text-brand-accent" />
          <h1 className="font-jakarta text-4xl font-bold tracking-tight text-brand-text md:text-5xl">
            Bienvenido a FoodSaver
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            Conectamos personas que desean donar alimentos con quienes los
            necesitan. Juntos reducimos el desperdicio y construimos una
            comunidad más solidaria.
          </p>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* Donor card */}
          <Card className="group flex flex-col bg-brand-card/90 shadow-xl ring-1 ring-foreground/5 backdrop-blur transition-shadow hover:shadow-2xl">
            <CardHeader className="items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent/10 ring-1 ring-brand-accent/20 transition-colors group-hover:bg-brand-accent/20">
                <HeartHandshake
                  size={28}
                  className="text-brand-accent"
                />
              </div>
              <CardTitle className="font-jakarta text-xl">
                Quiero ser Donador
              </CardTitle>
              <CardDescription>
                Publica tus excedentes de comida y ayuda a personas en situación
                vulnerable.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1" />
            <CardFooter>
              <Button
                size="lg"
                className="w-full cursor-pointer"
                onClick={() => navigate("/register-donor")}
              >
                Continuar como Donador
              </Button>
            </CardFooter>
          </Card>

          <Card className="group flex flex-col bg-brand-card/90 shadow-xl ring-1 ring-foreground/5 backdrop-blur transition-shadow hover:shadow-2xl">
            <CardHeader className="items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent/10 ring-1 ring-brand-accent/20 transition-colors group-hover:bg-brand-accent/20">
                <ShoppingBag
                  size={28}
                  className="text-brand-accent"
                />
              </div>
              <CardTitle className="font-jakarta text-xl">
                Quiero ser Beneficiario
              </CardTitle>
              <CardDescription>
                Solicita alimentos disponibles cerca de ti de manera sencilla y
                segura.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1" />
            <CardFooter>
              <Button
                size="lg"
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => navigate("/register-beneficiary")}
              >
                Continuar como Beneficiario
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8 gap-3 text-sm text-muted-foreground">
          <Separator className="w-16" />
          <span>
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/login"
              className="font-medium text-brand-accent transition-colors hover:text-brand-accent/80"
            >
              Inicia sesión
            </a>
          </span>
          <Separator className="w-16" />
        </div>
      </div>
    </div>
  );
};
