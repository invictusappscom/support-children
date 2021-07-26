### Configure

Create .env from .env.example and adjust params
```bash
cp .env.example .env
```

### Deploy contract
```bash
# on develop network
truffle migrate

# On Rinkeby
truffle migrate --network rinkeby
```

## Build
Install dependecies
```bash
cd client && npm i && cd ../server && npm i
```
Build client application
```bash
npm run build
```

### Run
```bash
npm start
```

### Dockerized Run
```bash
docker-compose up --build
```

### Test
Test all .js and .sol files in ./test directory with `truffle test`
```bash
npm run test
```

