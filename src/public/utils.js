const fs = require('fs')
const path = require('path')
const express = require("express")

class Contenedor{
    constructor(file){
        
        this.file = path.join(__dirname,'..','data',file)
    }

    async save(obj) {
        try {
            const objects = await this.getAllObjects();
            const lastId = objects.length > 0 ? objects[objects.length - 1].id : 0;
    
            const newId = lastId + 1;
            const existingProduct = objects.find((product) => product.id === obj.id);
    
            if (existingProduct) {
                // Si ya existe un producto con el mismo ID, actualiza sus campos
                Object.assign(existingProduct, obj);
                await this.saveObjects(objects);
                return existingProduct.id;
            } else {
                // Si no existe un producto con el mismo ID, crea uno nuevo
                const newObj = { id: newId, ...obj };
                objects.push(newObj);
                await this.saveObjects(objects);
                return newId;
            }
        } catch (error) {
            throw new Error('Error al guardar el Objeto');
        }
    }
    async getById(id){
        try{
            const objects = await this.getAllObjects()
            const obj = objects.find((o) => o.id === id)
            return obj || null
        } catch(error){
            throw new Error('Error al obtener el ID')
        }
    }
    async getAll(){
        try{
            const objects = await this.getAllObjects()
            return objects
        } catch(error){
            throw new Error('Error al obtener los objectos')
        }
    }

    async deleteById(id){
        try{
            let objects = await this.getAllObjects()
            objects = objects.filter((o) => o.id !== id)
            await this.saveObjects(objects)
        }catch (error){
            throw new Error('Error al eliminar los objectos')
        }
    }

    async deleteAll(){
        try{
            await this.saveObjects([])
        } catch(error){
            throw new Error('Error al eliminar los Objetos')
        }
    }
    async getAllObjects(){
        try{
            const data = await fs.promises.readFile(this.file,'utf-8')
            return data ? JSON.parse(data) : []
        }catch (error){
            return []
        }
    }

    async saveObjects(objects){
        try{
            await fs.promises.writeFile(this.file, JSON.stringify(objects, null, 2))
        }catch (error){
            throw new Error("Error al guardar Objetos")
        }
    }
}

module.exports = Contenedor;