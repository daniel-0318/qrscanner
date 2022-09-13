import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Registro } from '../models/registro.model';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  guardados: Registro[] = [];
  private _storage: Storage | null = null;

  constructor(private storage: Storage, private navCtrl: NavController, private iab: InAppBrowser) { 
    
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

}
