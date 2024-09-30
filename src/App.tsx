import { Redirect, Route, Router } from 'react-router-dom';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Ordered from './pages/History';
import Detail from './pages/Detail';
import Profile from './pages/Profile';



/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import {
  playCircle, radio, library, search, homeOutline, carSportOutline, cubeOutline, personOutline,
  notificationsOutline,
  timeOutline
} from 'ionicons/icons';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

/* Initialization tailwind css module */
import './index.css'
import BookingProcess from './pages/BookingProcess';
import Order from './pages/Order';
import OrderHistory from './pages/History';
import { useEffect } from 'react';
import HeathFacility from './pages/HeathFacility';

import { useHistory, useLocation } from 'react-router-dom';
import ConfirmBooking from './pages/ConfirmBooking';
import Login from './pages/Login';
import { useUser } from './hook/useUser';
import { useDispatch } from 'react-redux';
import Notifications from './pages/Notification';
import ConfirmOrder from './pages/ConfirmOrder';
import Hospital from './pages/Hospital';
import Pharmacy from './pages/Pharmacy';
import Register from './pages/Signup';




setupIonicReact();

export function hideTabs() {
  const fabButtonTab = document.querySelector("ion-fab");


  if (fabButtonTab) {
    fabButtonTab.hidden = true;
  }
}

export function showTabs() {
  const fabButtonTab = document.querySelector("ion-fab");

  if (fabButtonTab) {
    fabButtonTab.hidden = false;
  }
}

const routerAuth = ['/login']


const App: React.FC = (prop) => {
  const dispatch = useDispatch();
  const { loadUser } = useUser()

  useEffect(() => {

    if (!routerAuth.includes(window.location.pathname)) {
      loadUser()
      if (!loadUser().isLogin) {
        window.location.href = '/login'
      }
    }
  }, [dispatch])
  return <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect exact path="/" to="/home" />
          <Route path="/home" component={Home} exact />
          <Route path="/radio" component={Home} exact />
          <Route path="/profile" component={Profile} exact />
          <Route path="/history" component={OrderHistory} exact />
          <Route path="/order" component={Order} exact />
          <Route path="/healthfacilitylist" component={HeathFacility} exact />
          <Route path="/hospital" component={Hospital} exact />
          <Route path="/pharmacy" component={Pharmacy} exact />


          <Route path="/notification" component={Notifications} exact />

          <Route path='/confirm-booking' component={ConfirmBooking} exact />
          <Route path='/confirm-order' component={ConfirmOrder} exact />
          <Route path="/booking-process" component={BookingProcess} exact />
          <Route path="/login" component={Login} exact />
          <Route path="/signup" component={Register} exact />


        </IonRouterOutlet>


        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon icon={homeOutline} />
          </IonTabButton>

          <IonTabButton tab="radio" href="/history">
            <IonIcon icon={timeOutline} />
          </IonTabButton>

          <IonTabButton tab="ordered" href="/notification" onClick={()=>{alert("Functionality coming soon")}}>
            <IonIcon icon={notificationsOutline} />
          </IonTabButton>

          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={personOutline} />
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
};

export default App;
