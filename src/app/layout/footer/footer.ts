import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  imports: [MatIconModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly anio = new Date().getFullYear();

  protected readonly contacto = {
    sede: 'Sede Centro',
    direccion: 'San Martín 123',
    telefono: '(342) 400-0001',
    correo: 'contacto@clinicavirtual.com.ar',
  };

  protected readonly redes = [
    { nombre: 'Instagram', icono: 'photo_camera', url: 'https://www.instagram.com/clinicavirtual' },
    { nombre: 'Facebook', icono: 'groups', url: 'https://www.facebook.com/clinicavirtual' },
    { nombre: 'X', icono: 'alternate_email', url: 'https://x.com/clinicavirtual' },
  ];
}
