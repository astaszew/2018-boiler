import React, { Component, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, Store, Middleware } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '../reducers';
import rootSaga from '../sagas';
import history from '../history';

let store: Store;
const sagaMiddleware = createSagaMiddleware();

let myMiddleware: Middleware[] = [routerMiddleware(history), sagaMiddleware];

if (process.env.NODE_ENV === 'production') {
  myMiddleware = [sagaMiddleware, createLogger({ collapsed: true })];

  store = createStore(connectRouter(history)(rootReducer), applyMiddleware(...myMiddleware));
} else {
  myMiddleware.push(
    createLogger({
      collapsed: true,
    }),
  );

  store = createStore(
    connectRouter(history)(rootReducer),
    composeWithDevTools(applyMiddleware(...myMiddleware)),
  );

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default;
      store.replaceReducer(connectRouter(history)(nextRootReducer));
    });
  }
}

sagaMiddleware.run(rootSaga);

const finalizedStore = store;

// @ts-ignore
window.reduxStore = finalizedStore;

class ProviderClass extends Component<{ children?: ReactNode }> {
  render() {
    const { children } = this.props;

    return <Provider store={finalizedStore}>{children}</Provider>;
  }
}

export default ProviderClass;
