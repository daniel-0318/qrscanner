import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Registro } from '../models/registro.model';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  guardados: Registro[] = [];
  private _storage: Storage | null = null;

  constructor(private storage: Storage) { 
    
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

    this._storage.set("registros", this.guardados)

  }
}
