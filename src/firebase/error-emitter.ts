
'use client';

/**
 * @fileOverview A simple event emitter for centralizing Firebase errors.
 */

import { EventEmitter } from 'events';

class ErrorEmitter extends EventEmitter {}

export const errorEmitter = new ErrorEmitter();
