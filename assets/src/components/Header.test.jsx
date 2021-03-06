import React from 'react';
import { shallow, mount } from 'enzyme';
import Badge from '@material-ui/core/Badge';
import { Header } from './Header';
import { getRegion, clearRegion } from '../services/UserPreferences';

const mockContext = jest.fn();
jest.mock('../services/UserPreferences');
jest.mock('./UserContext', () => ({
  Consumer: ({ children }) => children(mockContext()),
}));

const history = { push: jest.fn() };
const createComponent = ({ theme, toggleTheme = () => {} } = {}) => shallow(
  <Header theme={theme} toggleTheme={toggleTheme} history={history} />,
);
const mountComponent = () => mount(<Header toggleTheme={() => {}} history={history} />);

describe('Header', () => {
  beforeEach(() => {
    delete global.location;
    global.location = { assign: jest.fn() };
    jest.resetAllMocks();
  });

  it('clears the region and redirects to home when clicking change region', () => {
    const header = createComponent();

    header.find('#change-region-button').simulate('click');

    expect(clearRegion).toHaveBeenCalled();
    expect(history.push).toHaveBeenCalledWith('/');
  });

  it('displays the default logo', () => {
    const header = createComponent();

    const logo = header.find({ 'data-testid': 'header-logo-link' }).first().find('img');

    expect(logo.props().src).toEqual('/static/images/logo.svg');
  });

  it('displays the alternative logo if dark mode is active', () => {
    const header = createComponent({ theme: { palette: { type: 'dark' } } });

    const logo = header.find({ 'data-testid': 'header-logo-link' }).first().find('img');

    expect(logo.props().src).toEqual('/static/images/logo-dark.svg');
  });

  it('displays the menu', () => {
    const header = createComponent();
    expect(header.find('.header-menu').exists()).toBeTruthy();
  });

  it('redirects to my books page when clicking on my books', () => {
    const header = createComponent();

    header.find('#my-books-button').simulate('click');

    expect(history.push).toHaveBeenCalledWith('/my-books');
  });

  it('redirects to admin page when clicking on admin button', () => {
    const header = createComponent();

    header.find('#admin-button').simulate('click');

    expect(global.location.assign).toHaveBeenCalledWith('/admin');
  });

  it('redirects to library page when clicking on home button', () => {
    getRegion.mockReturnValue('bh');
    const header = createComponent();

    header.find('#home-button').simulate('click');

    expect(history.push).toHaveBeenCalledWith('/libraries/bh');
  });

  it('redirects to home page when clicking on home button and no region is set', () => {
    getRegion.mockReturnValue(null);
    const header = createComponent();

    header.find('#home-button').simulate('click');

    expect(history.push).toHaveBeenCalledWith('/');
  });

  it('redirects to add book page when clicking on add book button', () => {
    const header = createComponent();

    header.find('#add-book-button').simulate('click');

    expect(global.location.assign).toHaveBeenCalledWith('/admin/books/book/isbn/');
  });

  it('has a badge with the borrowed book count in my books button', async () => {
    mockContext.mockReturnValue({ user: { borrowed_books_count: 5 } });

    const header = mountComponent();

    const badge = header.find('#my-books-button').find(Badge);

    expect(badge.exists()).toBeTruthy();
    expect(badge.props().badgeContent).toEqual(5);
  });

  it('calls toggleTheme prop when change theme button is clicked', () => {
    const toggleTheme = jest.fn();
    const header = createComponent({ toggleTheme });

    header.find({ 'data-testid': 'change-theme-button' }).first().simulate('click');

    expect(toggleTheme).toHaveBeenCalled();
  });
});
