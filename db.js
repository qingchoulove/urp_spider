'use strict';

import mongoose from 'mongoose';                                                                                         
export const databaseURL = 'mongodb://localhost:27017/student';                                                             
export function connectDatabase(uri) {                                                                                   
  return new Promise((resolve, reject) => {                                                                              
    mongoose.connection                                                                                                  
      .on('error', error => reject(error))                                                                               
      .on('close', () => console.log('Database connection closed.'))                                                     
      .once('open', () => resolve(mongoose.connections[0]));                                                             
    mongoose.Promise = global.Promise;                                                                                   
    mongoose.connect(uri);                                                                                               
  });                                                                                                                    
}