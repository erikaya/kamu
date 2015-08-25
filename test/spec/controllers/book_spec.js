'use strict';

describe('BookCtrl', function() {
  var scope, controller;
  
  beforeEach(module('libraryUiApp'));

  beforeEach(inject(function($controller, $rootScope){
    scope = $rootScope;
    controller = $controller('BookCtrl', { '$scope' : scope });
  }));


  describe('#autoCompleteSearch', function() {
    it('only shows isbn field', inject(function($controller, $rootScope) {
      scope.autoCompleteSearch();

      expect(scope.formShowable).toBe(false);
      expect(scope.errorShowable).toBe(false);
      expect(scope.searchShowable).toBe(true);
      expect(scope.isbnSearch).toBe(true);
    }));
  });

  describe('#findGoogleBooks', function(){
    it('expects book to be empty when criteria is empty', function(){
      scope.searchCriteria = '';

      scope.findGoogleBooks();

      expect(scope.book).toEqual({});
    });

    it('sets book properties correctly when book exists in library',
      inject(function($controller, $httpBackend, ENV){
        scope.searchCriteria = '985693865986';

        var data = {
                        '_embedded' : {
                          'books' : [
                            {
                              'title': 'How to enjoy pairing',
                              'subtitle': 'The francieli-ekow way',
                              'authors': ['Francieli', 'Ekow'],
                              'imageUrl': null
                            }
                          ]
                      }
                    }

        $httpBackend
          .expectGET(ENV.apiEndpoint + '/books/search/findByIsbn?isbn=' + scope.searchCriteria)
          .respond(200, data);

        $httpBackend.expectGET('views/library/index.html')
          .respond(200);
                    
        scope.findGoogleBooks();

        $httpBackend.flush();

        expect(scope.book.title).toEqual('How to enjoy pairing');
        expect(scope.book.subtitle).toEqual('The francieli-ekow way');
        expect(scope.book.authors).toEqual([ 'Francieli', 'Ekow' ]);
        expect(scope.book.imageUrl).toEqual('images\\no-image.png');

        expect(scope.bookExistsInTheLibrary).toBe(true);

        expect(scope.formShowable).toBe(true);
        expect(scope.errorShowable).toBe(false);
      })
    );

    it('toggles error display when library search returns an error', 
      inject(function($controller, $httpBackend, ENV){
        scope.searchCriteria = '985693865986';
          
        $httpBackend
          .expectGET(ENV.apiEndpoint + '/books/search/findByIsbn?isbn=' + scope.searchCriteria)
          .respond(500);

        $httpBackend.expectGET('views/library/index.html')
          .respond(200);
                    
        scope.findGoogleBooks();

        $httpBackend.flush();

        expect(scope.book).toEqual({});

        expect(scope.formShowable).toBe(false);
        expect(scope.errorShowable).toBe(true);
      })
    );

    describe('when book does not exist in library', function() {
      it('calls google service and setup up book', 
        inject(function($controller, $httpBackend, ENV){
          scope.searchCriteria = '985693865986';

          var libraryData = {};
          var googleData = {
                            'items' : [
                              {
                                'volumeInfo':
                                {
                                  'title': 'How to enjoy pairing - 2nd Edition',
                                  'subtitle': 'The francieli-ekow way',
                                  'industryIdentifiers': [
                                    {
                                      'type': 'ISBN_13',
                                      'identifier': scope.searchCriteria
                                    }
                                  ]
                                }
                              }
                            ]
                          }

          $httpBackend
            .expectGET(ENV.apiEndpoint + '/books/search/findByIsbn?isbn=' + scope.searchCriteria)
            .respond(200, libraryData);

          $httpBackend.expectGET('views/library/index.html')
            .respond(200);

          $httpBackend
            .expectGET('https://www.googleapis.com/books/v1/volumes?q=isbn:' + scope.searchCriteria)
            .respond(200, googleData);

          scope.findGoogleBooks();

          $httpBackend.flush();

          expect(scope.book.title).toEqual('How to enjoy pairing - 2nd Edition');
          expect(scope.book.subtitle).toEqual('The francieli-ekow way');
          expect(scope.book.isbn).toEqual('985693865986');

          expect(scope.bookExistsInTheLibrary).toBe(false);

          expect(scope.formShowable).toBe(true);
          expect(scope.errorShowable).toBe(false);
        })
      );

      it('shows error message when no book in found in google',
        inject(function($controller, $httpBackend, ENV){
          scope.searchCriteria = '985693865986';

          var libraryData = {};
          var googleData = {}

          $httpBackend
            .expectGET(ENV.apiEndpoint + '/books/search/findByIsbn?isbn=' + scope.searchCriteria)
            .respond(200, libraryData);

          $httpBackend.expectGET('views/library/index.html')
            .respond(200);

          $httpBackend
            .expectGET('https://www.googleapis.com/books/v1/volumes?q=isbn:' + scope.searchCriteria)
            .respond(200, googleData);

          scope.findGoogleBooks();

          $httpBackend.flush();

          expect(scope.book).toEqual({});

          expect(scope.formShowable).toBe(false);
          expect(scope.errorShowable).toBe(true);
        })
      );
    });
  });

  describe('#getCurrentLibraryPath', function(){
    it('routes to root when library path param is not set', function(){
      expect(scope.getCurrentLibraryPath()).toBe('#/libraries');
    });

    it('routes to library path when library path param is set', inject(function($location, $route){
      var route = $route;

      route.current = { 'pathParams': {'library': 'random'} }

      expect(scope.getCurrentLibraryPath()).toBe('#/library/random');
    }));
  });

  describe('#isInsideLibrary', function(){
    it('returns true when current route is defined',
      inject(function($route){
        var route = $route;

        route.current = { 'pathParams': {'library': 'random'} }

        expect(scope.isInsideLibrary()).toBe(true);
    }));

    it('returns false when current route is defined', function(){
      expect(scope.isInsideLibrary()).toBe(false);
    });
  });

  describe('#addManually', function(){
    it('sets initializes form elements correctly', function(){
      scope.addManually();

      expect(scope.book).toEqual({});
      expect(scope.searchShowable).toBe(false);
      expect(scope.isbnSearch).toBe(false);
      expect(scope.isGoogleBook).toBe(false);
      expect(scope.formShowable).toBe(true);
      expect(scope.errorShowable).toBe(false);
    });
  });
});