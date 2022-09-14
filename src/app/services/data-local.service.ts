import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Registro } from '../models/registro.model';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { File } from "@awesome-cordova-plugins/file/ngx";
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  guardados: Registro[] = [];
  private _storage: Storage | null = null;

  constructor(private storage: Storage, private navCtrl: NavController, 
    private iab: InAppBrowser, private file: File, 
    private emailComposer: EmailComposer) { 
    
    this.cargarStorage();

  }

 

  async cargarStorage(){

    try {
      const storage = await this.storage.create();
      this._storage = storage;
      const registros = await this._storage.get('registros');
      this.guardados = registros || [];
      console.log(this.guardados);
      
      
    } catch (error) {
      
    }

  }

  guardarRegistro(format: string, type: string){

    const nuevoRegistro = new Registro(format, type);
    this.guardados.unshift(nuevoRegistro);

    this._storage.set("registros", this.guardados);

    this.abrirRegistro(nuevoRegistro);

  }


  abrirRegistro(registro: Registro){

    this.navCtrl.navigateForward('tabs/tab2');

    switch (registro.type) {
      case 'http':
        this.iab.create(registro.text, '_system');

      case 'geo':
        this.navCtrl.navigateForward(`/tabs/tab2/mapa/${registro.text}`)
        break;

      default:
        break;
    }

  }

  enviarCorreo(){

    const arrTemp = [];
    const titulos = 'tipo, Formato, creado en, Texto\n';

    arrTemp.push(titulos);

    this.guardados.forEach(registro => {
      const linea = `${registro.type}, ${registro.format}, ${registro.created}, ${registro.text.replace(',', ' ')}\n`;

      arrTemp.push(linea);
    });

    
    this.crearArchivoFisico(arrTemp.join(' '));
    
  }

  crearArchivoFisico(text: string){

    this.file.checkFile(this.file.dataDirectory, 'registros.csv' )
    .then(existe => {
      console.log("Existe archivo?", existe);
      return this.escribirArchivo(text);
      
    }).catch(err =>{

      return this.file.createFile(this.file.dataDirectory, 'registro.csv', true)
      .then(creado => this.escribirArchivo(text))
      .catch(err2 => console.log("No se pudo crear el archivo", err2));
    });

    }


  async escribirArchivo(text: string){

    await this.file.writeExistingFile(this.file.dataDirectory, 'registro.csv', text);

    const archivo = `${this.file.dataDirectory}registro.csv`;

    const email = {
      to: 'danielramirez0318@gmail.com',
      // cc: 'erika@mustermann.de',
      // bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
        archivo
      ],
      subject: 'Backup de scans',
      body: 'Aqui tienen sus backups de los scans - <strong>ScanApp</strong>',
      isHtml: true
    }
    
    // Send a text message using default options
    this.emailComposer.open(email);
    

  }

}
