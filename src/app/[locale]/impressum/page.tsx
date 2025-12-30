import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ImpressumPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ImpressumPage({ params }: ImpressumPageProps) {
  const { locale } = await params;
  const isGerman = locale === 'de';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/${locale}/dashboard`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isGerman ? 'Zurück' : 'Back'}
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              {isGerman ? 'Impressum' : 'Legal Notice'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            {isGerman ? (
              <>
                <h2>Angaben gemäß § 5 TMG</h2>
                <p>
                  LDB-DataGuard GmbH<br />
                  Musterstraße 123<br />
                  24103 Kiel<br />
                  Deutschland
                </p>

                <h2>Vertreten durch</h2>
                <p>
                  Max Mustermann, Geschäftsführer
                </p>

                <h2>Kontakt</h2>
                <p>
                  Telefon: +49 (0) 431 123456<br />
                  E-Mail: info@ldb-dataguard.de
                </p>

                <h2>Registereintrag</h2>
                <p>
                  Eintragung im Handelsregister<br />
                  Registergericht: Amtsgericht Kiel<br />
                  Registernummer: HRB 12345
                </p>

                <h2>Umsatzsteuer-ID</h2>
                <p>
                  Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                  DE123456789
                </p>

                <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
                <p>
                  Max Mustermann<br />
                  Musterstraße 123<br />
                  24103 Kiel
                </p>

                <h2>Streitschlichtung</h2>
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                  <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </p>
                <p>
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                  Verbraucherschlichtungsstelle teilzunehmen.
                </p>

                <h2>Haftung für Inhalte</h2>
                <p>
                  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                  nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
                  Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde 
                  Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige 
                  Tätigkeit hinweisen.
                </p>

                <h2>Haftung für Links</h2>
                <p>
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
                  Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
                  Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
                  Seiten verantwortlich.
                </p>

                <h2>Urheberrecht</h2>
                <p>
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
                  dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
                  der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
                  Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
              </>
            ) : (
              <>
                <h2>Information according to § 5 TMG</h2>
                <p>
                  LDB-DataGuard GmbH<br />
                  Sample Street 123<br />
                  24103 Kiel<br />
                  Germany
                </p>

                <h2>Represented by</h2>
                <p>
                  Max Mustermann, Managing Director
                </p>

                <h2>Contact</h2>
                <p>
                  Phone: +49 (0) 431 123456<br />
                  Email: info@ldb-dataguard.de
                </p>

                <h2>Register Entry</h2>
                <p>
                  Entry in the Commercial Register<br />
                  Register Court: District Court Kiel<br />
                  Register Number: HRB 12345
                </p>

                <h2>VAT ID</h2>
                <p>
                  VAT identification number according to § 27 a VAT Act:<br />
                  DE123456789
                </p>

                <h2>Responsible for content according to § 55 Abs. 2 RStV</h2>
                <p>
                  Max Mustermann<br />
                  Sample Street 123<br />
                  24103 Kiel
                </p>

                <h2>Dispute Resolution</h2>
                <p>
                  The European Commission provides a platform for online dispute resolution (OS): 
                  <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </p>
                <p>
                  We are not willing or obliged to participate in dispute resolution proceedings 
                  before a consumer arbitration board.
                </p>

                <h2>Liability for Content</h2>
                <p>
                  As a service provider, we are responsible for our own content on these pages in 
                  accordance with general laws pursuant to § 7 Abs.1 TMG. According to §§ 8 to 10 TMG, 
                  however, we are not obligated to monitor transmitted or stored third-party information 
                  or to investigate circumstances that indicate illegal activity.
                </p>

                <h2>Liability for Links</h2>
                <p>
                  Our offer contains links to external websites of third parties, on whose contents we 
                  have no influence. Therefore, we cannot assume any liability for these external contents. 
                  The respective provider or operator of the pages is always responsible for the contents 
                  of the linked pages.
                </p>

                <h2>Copyright</h2>
                <p>
                  The content and works created by the site operators on these pages are subject to 
                  German copyright law. Duplication, processing, distribution, or any form of 
                  commercialization of such material beyond the scope of the copyright law shall 
                  require the prior written consent of its respective author or creator.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
