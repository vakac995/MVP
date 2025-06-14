import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Target, 
  Heart, 
  Lightbulb, 
  MessageSquare, 
  Vote,
  Euro,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  const features = [
    {
      icon: Lightbulb,
      title: "Kreiraj Projekte",
      description: "Predloži projekte koji će poboljšati našu zajednicu"
    },
    {
      icon: Vote,
      title: "Glasaj",
      description: "Podrži projekte koji ti se sviđaju glasanjem"
    },
    {
      icon: Euro,
      title: "Doniraj",
      description: "Finansijski podrži realizaciju projekata"
    },
    {
      icon: MessageSquare,
      title: "Diskutuj",
      description: "Učestvuj u diskusijama o napretku projekata"
    },
    {
      icon: Calendar,
      title: "Prati Napredak",
      description: "Budi u toku sa fazama realizacije projekata"
    },
    {
      icon: Users,
      title: "Udruži Se",
      description: "Povežuj se sa sugrađanima istih interesovanja"
    }
  ];

  const values = [
    {
      title: "Transparentnost",
      description: "Svi projekti su javni i dostupni za pregled svim građanima"
    },
    {
      title: "Zajedništvo",
      description: "Zajedno kreiramo bolje mesto za život svih nas"
    },
    {
      title: "Inovacija",
      description: "Prihvatamo nove ideje i kreativna rešenja"
    },
    {
      title: "Odgovornost",
      description: "Svaki projekat ima jasnu namenu i izveštaje o napretku"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          O zaJedno Caribrod
        </h1>
        <p className="text-lg md:text-xl mb-6 opacity-90 max-w-3xl mx-auto">
          Platforma koja povezuje građane Dimitrovgrada u realizaciji zajedničkih projekata 
          za bolju budućnost naše lokalne zajednice.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Users className="mr-1 h-4 w-4" />
            Zajednica
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Target className="mr-1 h-4 w-4" />
            Projekti
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Heart className="mr-1 h-4 w-4" />
            Solidarnost
          </Badge>
        </div>
      </div>

      {/* Mission Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Naša Misija</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-gray-700 text-center">
              zaJedno Caribrod je platforma koja omogućava građanima da predlože, diskutuju i 
              finansijski podrže projekte koji će poboljšati kvalitet života u našoj zajednici.
            </p>
            <p className="text-gray-600 text-center">
              Verujemo da najbolje ideje dolaze od samih građana koji najbolje poznaju potrebe 
              svoje sredine. Kroz transparentan proces glasanja i doniranja, zajedno biramo 
              projekte koji će imati najveći pozitivan uticaj na našu zajednicu.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">Kako Funkcioniše</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">Naše Vrednosti</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {values.map((value, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg text-blue-600">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">Kategorije Projekata</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Infrastruktura", desc: "Putevi, mostovi, javno osvetljenje" },
            { name: "Zajednica", desc: "Društveni centri, parkovi, rekreacija" },
            { name: "Obrazovanje", desc: "Škole, biblioteke, edukacija" },
            { name: "Životna sredina", desc: "Recikliranje, zelenilo, čistoća" },
            { name: "Kultura", desc: "Manifestacije, umetnost, tradicionalni događaji" },
            { name: "Sport", desc: "Sportski tereni, oprema, turniri" },
            { name: "Tehnologija", desc: "Digitalizacija, internet, aplikacije" },
            { name: "Zdravlje", desc: "Zdravstvena zaštita, prevencija, fitnes" }
          ].map((category, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-600 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Information */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Kontakt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-gray-700">
                <strong>zaJedno Caribrod</strong>
              </p>
              <p className="text-gray-600">
                Platforma za zajedničke projekte u Dimitrovgradu
              </p>
              <p className="text-gray-600">
                Email: info@zajednocaribrod.rs
              </p>
              <p className="text-gray-600">
                Adresa: Centar za građanske inicijative, Dimitrovgrad
              </p>
            </div>
            
            <div className="flex justify-center space-x-4 pt-4">
              <Button asChild>
                <Link to="/projects">Pregledaj Projekte</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/forum">Posetite Forum</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <section className="text-center py-8 text-gray-600">
        <p className="text-sm">
          © 2024 zaJedno Caribrod. Sva prava zadržana. <br />
          Napravljeno s ❤️ za našu zajednicu.
        </p>
      </section>
    </div>
  );
}