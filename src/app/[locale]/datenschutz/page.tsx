import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface DatenschutzPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DatenschutzPage({ params }: DatenschutzPageProps) {
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
              {isGerman ? 'Datenschutzerklärung' : 'Privacy Policy'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            {isGerman ? (
              <>
                <h2>1. Datenschutz auf einen Blick</h2>
                
                <h3>Allgemeine Hinweise</h3>
                <p>
                  Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
                  personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene 
                  Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                </p>

                <h3>Datenerfassung auf dieser Website</h3>
                <p>
                  <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                  Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen 
                  Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
                </p>

                <h2>2. Allgemeine Hinweise und Pflichtinformationen</h2>
                
                <h3>Datenschutz</h3>
                <p>
                  Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
                  Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen 
                  Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                </p>

                <h3>Hinweis zur verantwortlichen Stelle</h3>
                <p>
                  Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
                  LDB-DataGuard GmbH<br />
                  Musterstraße 123<br />
                  24103 Kiel<br /><br />
                  Telefon: +49 (0) 431 123456<br />
                  E-Mail: datenschutz@ldb-dataguard.de
                </p>

                <h2>3. Datenerfassung auf dieser Website</h2>
                
                <h3>Cookies</h3>
                <p>
                  Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Textdateien 
                  und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für 
                  die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem 
                  Endgerät gespeichert.
                </p>

                <h3>Server-Log-Dateien</h3>
                <p>
                  Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten 
                  Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
                </p>
                <ul>
                  <li>Browsertyp und Browserversion</li>
                  <li>verwendetes Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>Uhrzeit der Serveranfrage</li>
                  <li>IP-Adresse</li>
                </ul>

                <h3>Registrierung auf dieser Website</h3>
                <p>
                  Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen auf der 
                  Seite zu nutzen. Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung 
                  des jeweiligen Angebotes oder Dienstes, für den Sie sich registriert haben.
                </p>

                <h2>4. Analyse-Tools und Werbung</h2>
                <p>
                  Diese Website verwendet keine Tracking- oder Analyse-Tools von Drittanbietern.
                </p>

                <h2>5. Plugins und Tools</h2>
                
                <h3>OpenAI API</h3>
                <p>
                  Diese Anwendung nutzt die OpenAI API für KI-basierte Datenanalyse. Dabei werden 
                  POI-Daten zur Verarbeitung an OpenAI-Server übermittelt. Die Verarbeitung erfolgt 
                  gemäß den Datenschutzrichtlinien von OpenAI.
                </p>

                <h3>Google Places API</h3>
                <p>
                  Wir nutzen die Google Places API zur Validierung von POI-Daten. Dabei werden 
                  Anfragen an Google-Server gesendet. Es gelten die Datenschutzbestimmungen von Google.
                </p>

                <h2>6. Ihre Rechte</h2>
                <p>Sie haben jederzeit das Recht:</p>
                <ul>
                  <li>Auskunft über Ihre bei uns gespeicherten Daten zu erhalten (Art. 15 DSGVO)</li>
                  <li>Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)</li>
                  <li>Löschung Ihrer Daten zu verlangen (Art. 17 DSGVO)</li>
                  <li>Einschränkung der Verarbeitung zu verlangen (Art. 18 DSGVO)</li>
                  <li>Datenübertragbarkeit zu verlangen (Art. 20 DSGVO)</li>
                  <li>Der Verarbeitung zu widersprechen (Art. 21 DSGVO)</li>
                </ul>

                <p>
                  Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden: 
                  datenschutz@ldb-dataguard.de
                </p>
              </>
            ) : (
              <>
                <h2>1. Privacy at a Glance</h2>
                
                <h3>General Information</h3>
                <p>
                  The following information provides a simple overview of what happens to your personal 
                  data when you visit this website. Personal data is any data that can be used to 
                  personally identify you.
                </p>

                <h3>Data Collection on this Website</h3>
                <p>
                  <strong>Who is responsible for data collection on this website?</strong><br />
                  Data processing on this website is carried out by the website operator. You can find 
                  their contact details in the legal notice of this website.
                </p>

                <h2>2. General Information and Mandatory Information</h2>
                
                <h3>Data Protection</h3>
                <p>
                  The operators of these pages take the protection of your personal data very seriously. 
                  We treat your personal data confidentially and in accordance with the statutory data 
                  protection regulations and this privacy policy.
                </p>

                <h3>Note on the Responsible Party</h3>
                <p>
                  The responsible party for data processing on this website is:<br /><br />
                  LDB-DataGuard GmbH<br />
                  Sample Street 123<br />
                  24103 Kiel, Germany<br /><br />
                  Phone: +49 (0) 431 123456<br />
                  Email: privacy@ldb-dataguard.de
                </p>

                <h2>3. Data Collection on this Website</h2>
                
                <h3>Cookies</h3>
                <p>
                  Our websites use so-called "cookies". Cookies are small text files and do not cause 
                  any damage to your device. They are stored either temporarily for the duration of a 
                  session (session cookies) or permanently (permanent cookies) on your device.
                </p>

                <h3>Server Log Files</h3>
                <p>
                  The provider of the pages automatically collects and stores information in so-called 
                  server log files, which your browser automatically transmits to us. These are:
                </p>
                <ul>
                  <li>Browser type and version</li>
                  <li>Operating system used</li>
                  <li>Referrer URL</li>
                  <li>Hostname of the accessing computer</li>
                  <li>Time of the server request</li>
                  <li>IP address</li>
                </ul>

                <h3>Registration on this Website</h3>
                <p>
                  You can register on this website to use additional functions. We only use the data 
                  entered for the purpose of using the respective offer or service for which you have 
                  registered.
                </p>

                <h2>4. Analytics and Advertising</h2>
                <p>
                  This website does not use third-party tracking or analytics tools.
                </p>

                <h2>5. Plugins and Tools</h2>
                
                <h3>OpenAI API</h3>
                <p>
                  This application uses the OpenAI API for AI-based data analysis. POI data is 
                  transmitted to OpenAI servers for processing. Processing is carried out in accordance 
                  with OpenAI's privacy policy.
                </p>

                <h3>Google Places API</h3>
                <p>
                  We use the Google Places API to validate POI data. Requests are sent to Google servers. 
                  Google's privacy policy applies.
                </p>

                <h2>6. Your Rights</h2>
                <p>You have the right at any time to:</p>
                <ul>
                  <li>Obtain information about your data stored with us (Art. 15 GDPR)</li>
                  <li>Request correction of incorrect data (Art. 16 GDPR)</li>
                  <li>Request deletion of your data (Art. 17 GDPR)</li>
                  <li>Request restriction of processing (Art. 18 GDPR)</li>
                  <li>Request data portability (Art. 20 GDPR)</li>
                  <li>Object to processing (Art. 21 GDPR)</li>
                </ul>

                <p>
                  If you have any questions about data protection, please contact us at any time: 
                  privacy@ldb-dataguard.de
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
