import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Edit, Trash2, GripVertical, Check, X } from 'lucide-react';

// Mock data for data fields
const mockDataFields = [
  { id: '1', key: 'name', schemaOrgProperty: 'name', displayName: 'Name', isRequired: true, isActive: true, displayOrder: 1 },
  { id: '2', key: 'street', schemaOrgProperty: 'streetAddress', displayName: 'Straße', isRequired: true, isActive: true, displayOrder: 2 },
  { id: '3', key: 'postalCode', schemaOrgProperty: 'postalCode', displayName: 'PLZ', isRequired: true, isActive: true, displayOrder: 3 },
  { id: '4', key: 'city', schemaOrgProperty: 'addressLocality', displayName: 'Stadt', isRequired: true, isActive: true, displayOrder: 4 },
  { id: '5', key: 'phone', schemaOrgProperty: 'telephone', displayName: 'Telefon', isRequired: false, isActive: true, displayOrder: 5 },
  { id: '6', key: 'email', schemaOrgProperty: 'email', displayName: 'E-Mail', isRequired: false, isActive: true, displayOrder: 6 },
  { id: '7', key: 'website', schemaOrgProperty: 'url', displayName: 'Website', isRequired: false, isActive: true, displayOrder: 7 },
  { id: '8', key: 'openingHours', schemaOrgProperty: 'openingHours', displayName: 'Öffnungszeiten', isRequired: false, isActive: true, displayOrder: 8 },
  { id: '9', key: 'priceRange', schemaOrgProperty: 'priceRange', displayName: 'Preisklasse', isRequired: false, isActive: false, displayOrder: 9 },
  { id: '10', key: 'cuisine', schemaOrgProperty: 'servesCuisine', displayName: 'Küche', isRequired: false, isActive: false, displayOrder: 10 },
];

interface FieldsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FieldsPage({ params }: FieldsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const isGerman = locale === 'de';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isGerman ? 'Datenfelder' : 'Data Fields'}
          </h1>
          <p className="text-muted-foreground">
            {isGerman 
              ? 'Konfigurieren Sie die Schema.org Felder für POI-Vergleiche' 
              : 'Configure Schema.org fields for POI comparisons'}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {isGerman ? 'Neues Feld' : 'New Field'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Gesamt' : 'Total'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDataFields.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Aktiv' : 'Active'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockDataFields.filter(f => f.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Pflichtfelder' : 'Required'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockDataFields.filter(f => f.isRequired).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Schema.org' : 'Schema.org'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDataFields.filter(f => f.schemaOrgProperty).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fields Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'Feldkonfiguration' : 'Field Configuration'}</CardTitle>
          <CardDescription>
            {isGerman 
              ? 'Ziehen Sie Felder um die Reihenfolge zu ändern' 
              : 'Drag fields to change the order'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>{isGerman ? 'Schlüssel' : 'Key'}</TableHead>
                <TableHead>Schema.org</TableHead>
                <TableHead>{isGerman ? 'Anzeigename' : 'Display Name'}</TableHead>
                <TableHead className="text-center">{isGerman ? 'Pflicht' : 'Required'}</TableHead>
                <TableHead className="text-center">{isGerman ? 'Aktiv' : 'Active'}</TableHead>
                <TableHead className="text-right">{isGerman ? 'Aktionen' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDataFields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{field.key}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{field.schemaOrgProperty}</Badge>
                  </TableCell>
                  <TableCell>{field.displayName}</TableCell>
                  <TableCell className="text-center">
                    {field.isRequired ? (
                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={field.isActive ? 'success' : 'secondary'}>
                      {field.isActive ? (isGerman ? 'Aktiv' : 'Active') : (isGerman ? 'Inaktiv' : 'Inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Field Form */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'Neues Feld hinzufügen' : 'Add New Field'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="key">{isGerman ? 'Schlüssel' : 'Key'}</Label>
              <Input id="key" placeholder="z.B. paymentMethods" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schemaOrg">Schema.org Property</Label>
              <Input id="schemaOrg" placeholder="z.B. paymentAccepted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">{isGerman ? 'Anzeigename' : 'Display Name'}</Label>
              <Input id="displayName" placeholder="z.B. Zahlungsmethoden" />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {isGerman ? 'Hinzufügen' : 'Add'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
