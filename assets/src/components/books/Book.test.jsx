import React from 'react';
import { shallow } from 'enzyme';
import Button from '@material-ui/core/Button';
import Book from './Book';
import { currentUser } from '../../../test/userHelper';
import {
  someBook,
  someBookWithAvailableCopies,
  someBookWithNoAvailableCopies,
  someBookWithACopyFromMe,
  someBookThatCanBeAddedToWaitlist,
  borrowAction,
  returnAction,
} from '../../../test/booksHelper';
import { borrowCopy, returnBook, joinWaitlist } from '../../services/BookService';

jest.mock('../../services/BookService');

expect.extend({
  toHaveBorrowButton(received) {
    const button = received.find(Button);
    const pass = button.exists()
          && button.children().text() === 'Borrow'
          && button.length === 1;
    return { pass, message: () => 'expected component to have a borrow button' };
  },

  toHaveReturnButton(received) {
    const button = received.find(Button);
    const pass = button.exists()
          && button.children().text() === 'Return'
          && button.length === 1;
    return { pass, message: () => 'expected component to have a return button' };
  },

  toHaveJoinWaitlistButton(received) {
    const button = received.find(Button);
    const pass = button.exists()
          && button.children().text() === 'Join the waitlist'
          && button.length === 1;
    return { pass, message: () => 'expected component to have a waitlist button' };
  },
});

const createComponent = (book) => shallow(<Book book={book} library="bh" />);

describe('Book', () => {
  beforeEach(() => {
    global.currentUser = currentUser;
    global.window.ga = () => { };
  });

  it('should contain the book cover as background image', () => {
    const book = someBook();

    const bookComponent = createComponent(book);

    expect(bookComponent.find('.book-cover').props().style.backgroundImage).toEqual(`url('${book.image_url}')`);
  });

  it('shows the borrow button when the book has a borrow action', () => {
    const book = someBookWithAvailableCopies();
    const bookComponent = createComponent(book);

    expect(bookComponent).toHaveBorrowButton();
  });

  it('shows the return button when clicking borrow and API sends return action', async () => {
    borrowCopy.mockResolvedValue({ action: returnAction });
    const book = someBookWithAvailableCopies();
    const bookComponent = createComponent(book);

    await bookComponent.find(Button).simulate('click');

    expect(bookComponent).toHaveReturnButton();
  });

  it('calls the borrow function when clicking on the borrow button', async () => {
    const book = someBookWithAvailableCopies();
    const bookComponent = createComponent(book);

    await bookComponent.find(Button).simulate('click');

    expect(borrowCopy).toHaveBeenCalledWith(book, 'bh');
  });

  it('shows the return button when the book has a return action', () => {
    const book = someBookWithACopyFromMe();
    const bookComponent = createComponent(book);

    expect(bookComponent).toHaveReturnButton();
  });

  it('shows the borrow button when clicking return and API sends borrow action', async () => {
    returnBook.mockResolvedValue({ action: borrowAction });
    const book = someBookWithACopyFromMe();
    const bookComponent = createComponent(book);

    await bookComponent.find(Button).simulate('click');

    expect(bookComponent).toHaveBorrowButton();
  });

  it('calls the return function when clicking on the return button', async () => {
    const book = someBookWithACopyFromMe();
    const bookComponent = createComponent(book);

    await bookComponent.find(Button).simulate('click');

    expect(returnBook).toHaveBeenCalledWith(book, 'bh');
  });

  it('has no action button when the book has no action', () => {
    const book = someBook([], [], null);
    const bookComponent = createComponent(book);

    expect(bookComponent.find(Button).exists()).toBeFalsy();
  });

  describe('if waitlist feature is enabled', () => {
    beforeAll(() => {
      window.history.pushState({}, 'Testing with Waitlist Enabled', '/?waitlist=active');
    });

    it('shows the join waitlist button when book can be added to waitlist', async () => {
      const book = someBookThatCanBeAddedToWaitlist();
      const bookComponent = createComponent(book);

      expect(bookComponent).toHaveJoinWaitlistButton();
    });

    it('calls the joinWaitlist method when clicking on the join the waitlist button', async () => {
      joinWaitlist.mockResolvedValue({ action: null });
      const book = someBookThatCanBeAddedToWaitlist();
      const bookComponent = createComponent(book);

      await bookComponent.find(Button).simulate('click');

      expect(joinWaitlist).toHaveBeenCalledWith(book, 'bh');
      expect(bookComponent).not.toHaveJoinWaitlistButton();
    });
  });

  describe('if waitlist feature is disabled', () => {
    beforeAll(() => {
      window.history.pushState({}, 'Testing with Waitlist Disabled', '/');
    });

    it('does not show the join waitlist button when book can be added to waitlist', async () => {
      const book = someBookThatCanBeAddedToWaitlist();
      const bookComponent = createComponent(book);

      expect(bookComponent).not.toHaveJoinWaitlistButton();
    });
  });

  it('does not show the buttons when the book does not have available copies, ', () => {
    const book = someBookWithNoAvailableCopies();
    const bookComponent = createComponent(book);

    expect(bookComponent).not.toHaveBorrowButton();
    expect(bookComponent).not.toHaveReturnButton();
  });
});