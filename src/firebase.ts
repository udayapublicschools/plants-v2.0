/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import workspaceConfig from '../firebase-applet-config.json';

// User's custom web app Firebase configuration
const customConfig = {
  apiKey: "AIzaSyCWqTXu-Qm2-p81zVBS4EdMqUsdTJ6ywXU",
  authDomain: "plant-68b31.firebaseapp.com",
  projectId: "plant-68b31",
  storageBucket: "plant-68b31.firebasestorage.app",
  messagingSenderId: "342854070064",
  appId: "1:342854070064:web:357b5edcfb7b2c022fe2f5",
  measurementId: "G-SFML8HBQMW"
};

// Check if we should use the built-in, secure workspace database
// Default to 'true' (use sandbox workspace) if not explicitly set to 'false'.
const useSandbox = localStorage.getItem('ecoplanter_use_sandbox') !== 'false';

const firebaseConfig = useSandbox ? workspaceConfig : customConfig;

const app = initializeApp(firebaseConfig);

// Initialize Firestore with appropriate database ID if using workspaceConfig sandbox
export const db = useSandbox 
  ? getFirestore(app, (workspaceConfig as any).firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Custom Firestore error handler that throws a stringified JSON containing structured metadata for diagnosis.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validation block to test connection to Firestore server
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system_test_config_test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
  }
}

testConnection();
