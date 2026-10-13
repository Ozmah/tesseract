import { CaretDownIcon } from '@phosphor-icons/react';
import { AperturePanel } from '@/components/aperture/aperture-panel';
import { ApertureSection } from '@/components/aperture/aperture-section';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

export function ContentSection() {
    return (
        <ApertureSection
            id="content"
            title="Contenido"
            description="Tarjetas, navegación secundaria y agrupadores."
        >
            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>MediaMTX</CardTitle>
                        <CardDescription>Distribución de video</CardDescription>
                        <CardAction>
                            <Badge variant="outline">v1.21.2</Badge>
                        </CardAction>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        4 rutas configuradas, grabación desactivada.
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" size="sm">
                            Ver rutas
                        </Button>
                    </CardFooter>
                </Card>
                <AperturePanel title="Navegación">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#content">
                                    Cámaras
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>TARS</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <Separator />
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>GA</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                            <p className="font-medium">Administrador</p>
                            <p className="text-muted-foreground">
                                Acceso completo
                            </p>
                        </div>
                    </div>
                </AperturePanel>
                <AperturePanel title="Colapsable">
                    <Collapsible className="w-full">
                        <CollapsibleTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between"
                                />
                            }
                        >
                            Detalles técnicos
                            <CaretDownIcon />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-sm">
                                <dt className="text-muted-foreground">
                                    transport
                                </dt>
                                <dd>WebRTC (WHEP)</dd>
                                <dt className="text-muted-foreground">rtsp</dt>
                                <dd>TCP</dd>
                            </dl>
                        </CollapsibleContent>
                    </Collapsible>
                </AperturePanel>
            </div>
        </ApertureSection>
    );
}
