const fs = require('fs');
const readline = require('readline');
const utils = require('./utils');
// Read the OpenVPN server status log file



async function main(){
  try {
    const result = await utils.parseLog('status.log');
    console.log(result.clientList);
    console.log(result.routingTable);
  } catch (error) {
    console.error(error);
  }
  
}
 

main()