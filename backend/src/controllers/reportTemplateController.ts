// backend/src/controllers/reportTemplateController.ts
import { Request, Response } from 'express';
import * as templateService from '../services/reportTemplateService.js';
import { TemplateNotFoundError, TemplateTitleExistsError } from '../errors/reportTemplateErrors.js';

const handleError = (res: Response, error: unknown) => {
  if (error instanceof TemplateNotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  if (error instanceof TemplateTitleExistsError) {
    return res.status(409).json({ error: error.message });
  }
  console.error('Error en reportTemplateController:', error);
  res.status(500).json({ error: 'Error interno del servidor.' });
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const newTemplate = await templateService.createTemplate(req.body);
    res.status(201).json(newTemplate);
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await templateService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    handleError(res, error);
  }
};

export const getPublishedTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await templateService.getPublishedTemplates();
    res.json(templates);
  } catch (error) {
    handleError(res, error);
  }
};

export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await templateService.getTemplateById(parseInt(id));
    res.json(template);
  } catch (error) {
    handleError(res, error);
  }
};

export const publishTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { publish } = req.body;
    const updated = await templateService.publishTemplate(parseInt(id), publish);
    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

export const cloneTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cloned = await templateService.cloneTemplate(parseInt(id));
    res.status(201).json(cloned);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateTemplateMeta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await templateService.updateTemplateMeta(parseInt(id), req.body);
    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateTemplateFull = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await templateService.updateTemplateFull(parseInt(id), req.body);
    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};