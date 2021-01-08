const socket = io('http://localhost:4000');

function getCities() {
  return fetch('http://localhost:4000/cities')
    .then((response) => response.json())
    .then((data) => data);
}

function handleDisconnect() {
  socket.on('disconnect', () => {
    console.log('Disconnected!');
  });
}

function subscribeToCityForecastChanges(id) {
  socket.on(`city-${id}`, (data) => {
    console.log('-----------------------------------------------');
    console.log('-----------------------------------------------');
    console.log('The following city has been changed!');
    console.log(data);
  });
}

async function bootstrap() {
  console.log('Application started.');
  console.log('Getting cities...');
  const cities = await getCities();
  console.log(cities);
  console.log('Subscribing to all cities');
  for (const city of cities) {
    console.log('-----------------------------------------------');
    subscribeToCityForecastChanges(city.id);
    console.log(`Subscribed to ${city.name} changes.`);
  }
  handleDisconnect();
}
bootstrap();
