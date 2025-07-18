import express from 'express';
import dotenv from 'dotenv';
import iotRouter from './routes/iot';

dotenv.config();
const app = express();

app.use(express.json());
app.use('/api/iot', iotRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
