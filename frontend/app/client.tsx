import {SharedProfile} from './social';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {AccountProvider} from './accounts';
import Decant from './decant';
createRoot(document.getElementById('root')!).render(<AccountProvider>{new URLSearchParams(location.search).get('profile')?<SharedProfile username={new URLSearchParams(location.search).get('profile')!}/>:<Decant/>}</AccountProvider>);
