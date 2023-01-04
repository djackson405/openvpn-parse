const fs = require('fs');
const readline = require('readline');


function removePort(str) {
  return str.replace(/:\d+$/, '');
}

async function parseLog(statusLogPath) {
  return new Promise((resolve, reject) => {
    // Read the OpenVPN server status log file
    const fileStream = fs.createReadStream(statusLogPath);
    // Create a new interface for reading the file line by line
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let clientList = [];
    let routingTable = [];
    let currentSection = null;

    // Read each line of the file
    rl.on('line', (line) => {
      // Check if this line marks the start of a new section
      if (line.startsWith('OpenVPN CLIENT LIST')) {
        currentSection = 'clientList';
      } else if (line.startsWith('ROUTING TABLE')) {
        currentSection = 'routingTable';
      } else if (line.startsWith('GLOBAL STATS')) {
        currentSection = null;
      } else if (currentSection === 'clientList') {
        // Skip the header line
        if (!line.startsWith('Common Name')) {
          // Parse the line as a client list entry and add it to the clientList array
          const [commonName, realAddress, bytesReceived, bytesSent, connectedSince] = line.split(',');
          clientList.push({
            commonName,
            realAddress,
            bytesReceived: parseInt(bytesReceived, 10),
            bytesSent: parseInt(bytesSent, 10),
            connectedSince
          });
        }
      } else if (currentSection === 'routingTable') {
        // Skip the header line
        if (!line.startsWith('Virtual Address')) {
          // Parse the line as a routing table entry and add it to the routingTable array
          let [virtualAddress, commonName, realAddress, lastRef] = line.split(',');
           realAddress=removePort(realAddress);
           routingTable.push({
            virtualAddress,
            commonName,
            realAddress,
            lastRef
          });
        }
      }
    });

    // Once the file has been fully read, join the clientList and routingTable arrays on the commonName field and resolve the promise with the joined array
    rl.on('close', () => {
      const joinedArray = clientList.map(client => {
        const matchingRoute = routingTable.find(route => route.commonName === client.commonName);
        if (matchingRoute) {
          return { ...client, ...matchingRoute };
        }
      }).filter(Boolean);
      resolve(joinedArray);
    });

    // If there is an error reading the file, reject the promise with the error
    rl.on('error', (error) => {
      reject(error);
    });
  });
}


module.exports ={ parseLog }