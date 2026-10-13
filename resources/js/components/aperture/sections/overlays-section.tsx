import {
    ArrowClockwiseIcon,
    DotsThreeVerticalIcon,
    GearIcon,
    TrashIcon,
} from '@phosphor-icons/react';
import { AperturePanel } from '@/components/aperture/aperture-panel';
import { ApertureSection } from '@/components/aperture/aperture-section';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export function OverlaysSection() {
    return (
        <ApertureSection
            id="overlays"
            title="Overlays"
            description="Diálogos, paneles laterales, menús y tooltips."
        >
            <div className="grid gap-6 lg:grid-cols-4">
                <AperturePanel title="Diálogo">
                    <Dialog>
                        <DialogTrigger
                            render={<Button variant="destructive" />}
                        >
                            Quitar cámara
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>¿Quitar CASE?</DialogTitle>
                                <DialogDescription>
                                    Deja de aparecer en el visor. Puedes volver
                                    a autorizarla después.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose
                                    render={<Button variant="secondary" />}
                                >
                                    Cancelar
                                </DialogClose>
                                <DialogClose
                                    render={<Button variant="destructive" />}
                                >
                                    Quitar
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </AperturePanel>
                <AperturePanel title="Panel lateral">
                    <Sheet>
                        <SheetTrigger render={<Button variant="outline" />}>
                            Detalles
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>TARS</SheetTitle>
                                <SheetDescription>
                                    Cámara principal del patio.
                                </SheetDescription>
                            </SheetHeader>
                            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 px-4 font-mono text-sm">
                                <dt className="text-muted-foreground">path</dt>
                                <dd>tars</dd>
                                <dt className="text-muted-foreground">codec</dt>
                                <dd>H.264</dd>
                            </dl>
                        </SheetContent>
                    </Sheet>
                </AperturePanel>
                <AperturePanel title="Menú">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Acciones de cámara"
                                />
                            }
                        >
                            <DotsThreeVerticalIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>TARS</DropdownMenuLabel>
                                <DropdownMenuItem>
                                    <ArrowClockwiseIcon />
                                    Reconectar
                                    <DropdownMenuShortcut>
                                        R
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <GearIcon />
                                    Ajustes
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive">
                                <TrashIcon />
                                Quitar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </AperturePanel>
                <AperturePanel title="Tooltip">
                    <Tooltip>
                        <TooltipTrigger render={<Button variant="outline" />}>
                            Pasa el cursor
                        </TooltipTrigger>
                        <TooltipContent>
                            Doble clic para restablecer el zoom
                        </TooltipContent>
                    </Tooltip>
                </AperturePanel>
            </div>
        </ApertureSection>
    );
}
