import axios, { AxiosRequestConfig } from 'axios';
import Storage from './Storage';
import store from '../../redux/store';
import { setUser } from '../../redux/reducers/userReducer';
import { getConfig } from '../config';
import { UserModel } from '../../types/model';

/**
 * Build HTTP request that returs Promise of the response
 * 
 * @param {string} url URL path without baseurl
 * @param {axios/AxiosRequestConfig} args Axios config arguments
 * @returns {Promise<Data, AxiosResponse>}
 */
const httpService = async (url: string, args: AxiosRequestConfig = {}): Promise<any> => {
  const { data = {}, method } = args;
  const isExternal = url.indexOf('http') === 0;
  let domain = getConfig('API_URL');

  if (url.indexOf('optiktunggal:') === 0) {
    domain = getConfig('API_OT_URL');

    url = url.substr('optiktunggal:'.length);
  }

  if (!method) {
    args.method = 'POST';
  } else if ('get' === method.toLowerCase()) {
    args.params = data;

    delete args.data;
  }

  const apiUrl = isExternal ? url : domain + url;

  return axios({
    url: apiUrl,
    ...args
  }).then(response => {
    const { data } = response;

    return Promise.resolve(data);
  }).catch(({ response = {}, ...rest }) => {
    console.error("CATCH", apiUrl, response, rest);

    return Promise.reject(response.data || {});
  });
}

/**
 * Set current User and setup its utilities
 * 
 * @param {User|null} user 
 */
const setCurrentUser = (user: UserModel) => {
  store.dispatch(setUser(user));

  if (!user) {
    delete axios.defaults.headers.common["Authorization"];
  } else {
    user.api_token && (axios.defaults.headers.common["Authorization"] = "Bearer " + user.api_token);
  }
};

/**
 * Set user
 * 
 * @param {User|null} user 
 * @returns {Promise<User>} Promise of User
 */
httpService.setUser = async (user: UserModel): Promise<UserModel> => {
  await Storage.storeData('user', user);

  setCurrentUser(user);

  return new Promise(resolve => resolve(user));
};

/**
 * Get User from storage
 * 
 * @returns {User|null}
 */
httpService.getUser = async (): Promise<UserModel> => {
  const user = await Storage.getData('user');

  user && setCurrentUser(user);

  return user;
};

/**
 * Logout and remove user from storage
 * 
 * @returns {Promise<void>}
 */
httpService.logout = () => {
  setCurrentUser(null);

  return Storage.storeData('user', null);
};

export default httpService;
