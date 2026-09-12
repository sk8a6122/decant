import React from 'react';
import {createRoot} from 'react-dom/client';
import {AccountProvider} from './accounts';
import Decant from './decant';
createRoot(document.getElementById('root')!).render(<AccountProvider><Decant/></AccountProvider>);
