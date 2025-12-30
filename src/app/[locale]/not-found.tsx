import { FileQuestion, Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="h-7 w-7 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Seite nicht gefunden</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Die angeforderte Seite existiert nicht oder wurde verschoben.
            Bitte überprüfen Sie die URL oder nutzen Sie die Navigation.
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center text-sm">
            <span className="px-3 py-1 bg-muted rounded-full text-muted-foreground">
              404 - Not Found
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <a href="#" onClick={() => typeof window !== 'undefined' && window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">
              <Search className="mr-2 h-4 w-4" />
              Suchen
            </a>
          </Button>
          <Button asChild>
            <a href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
