import { Type } from '@angular/core';
import { Observable } from 'rxjs';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { SedeService } from '../../../core/services/sede.service';

/**
 * Sedes, especialidades y coberturas son catálogos con el mismo comportamiento
 * (listar, filtrar, alta, modificación y baja): una sola pantalla los maneja a los tres
 * a partir de esta configuración, que cada ruta pasa en su `data`.
 */

export interface ItemCatalogo {
  id: number;
}

/** Lo que tienen en común SedeService, EspecialidadService y CoberturaService. */
export interface ServicioCatalogo {
  listar(): Observable<ItemCatalogo[]>;
  crear(datos: Record<string, string>): Observable<ItemCatalogo>;
  actualizar(id: number, datos: Record<string, string>): Observable<ItemCatalogo>;
  eliminar(id: number): Observable<void>;
}

export interface CampoCatalogo {
  clave: string;
  etiqueta: string;
  largoMaximo: number;
  /** Validación adicional, por ejemplo un teléfono solo con números. */
  patron?: { regex: RegExp; mensaje: string };
}

export interface ConfigCatalogo {
  titulo: string;
  subtitulo: string;
  icono: string;
  /** Nombre en singular, en minúscula: "sede". Los tres catálogos son femeninos. */
  singular: string;
  /** El primer campo es el que identifica al registro en los mensajes. */
  campos: CampoCatalogo[];
  servicio: Type<ServicioCatalogo>;
}

export const CATALOGO_SEDES: ConfigCatalogo = {
  titulo: 'Sedes',
  subtitulo: 'Sedes de la clínica donde atienden los médicos.',
  icono: 'location_city',
  singular: 'sede',
  campos: [
    { clave: 'nombre', etiqueta: 'Nombre', largoMaximo: 50 },
    { clave: 'direccion', etiqueta: 'Dirección', largoMaximo: 100 },
    {
      clave: 'telefono',
      etiqueta: 'Teléfono',
      largoMaximo: 20,
      patron: { regex: /^\d{6,20}$/, mensaje: 'Ingresá solo números (entre 6 y 20 dígitos).' },
    },
  ],
  servicio: SedeService,
};

export const CATALOGO_ESPECIALIDADES: ConfigCatalogo = {
  titulo: 'Especialidades',
  subtitulo: 'Especialidades médicas que se pueden asignar a los médicos y a su agenda.',
  icono: 'medical_services',
  singular: 'especialidad',
  campos: [{ clave: 'descripcion', etiqueta: 'Descripción', largoMaximo: 50 }],
  servicio: EspecialidadService,
};

export const CATALOGO_COBERTURAS: ConfigCatalogo = {
  titulo: 'Coberturas',
  subtitulo: 'Obras sociales y prepagas que eligen los pacientes al registrarse.',
  icono: 'health_and_safety',
  singular: 'cobertura',
  campos: [{ clave: 'nombre', etiqueta: 'Nombre', largoMaximo: 50 }],
  servicio: CoberturaService,
};

/** Valor de un campo de texto de cualquier registro del catálogo. */
export function valorCampo(item: ItemCatalogo, clave: string): string {
  return String((item as unknown as Record<string, unknown>)[clave] ?? '');
}
