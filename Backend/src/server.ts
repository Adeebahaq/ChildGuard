// src/server.ts 

import express from 'express';
import cors from 'cors';
import path from 'path'; 
import authRoutes from './routes/authRoutes'; 
import indexRouter from './routes/index'; 
import caseReporterRoutes from "./routes/caseReporterRoutes";
import visitsRoutes from "./routes/visitsRoutes";
import volunteerRoutes from "./routes/volunteerRoutes";
import userRoutes from "./routes/UserRoutes";
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads'))); 
app.use('/', indexRouter); 
app.use('/api/auth', authRoutes);
app.use("/case", caseReporterRoutes); 
app.use("/visits", visitsRoutes);
app.use("/volunteer", volunteerRoutes);
app.use("/user", userRoutes);
app.use("/availability", userRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static uploads from: ${path.join(__dirname, '..', 'public', 'uploads')}`);
});