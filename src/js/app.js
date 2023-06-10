  App = {
    web3Provider: null,
    contracts: {},
    init: async function () {
  


      $.getJSON('../figures.json', function (data) {
        var figuresRow = $('#FiguresRow');
        var figureTemplate = $('#FigureTemplate');
        for (i = 0; i < data.length; i++) {
          figureTemplate.find('.panel-title').text(data[i].name);
          figureTemplate.find('img').attr('src', data[i].picture);
          figureTemplate.find('.figure-units').text(data[i].units);
          figureTemplate.find('.figure-price').text(`${data[i].price} ETH`);
          figureTemplate.find('.figure-category').text(data[i].category);
          figureTemplate.find('.btn-buy').attr('data-id', data[i].id);
          figureTemplate.find('#FigureID').text(data[i].name);
          figuresRow.append(figureTemplate.html());
        }
      });

      return await App.initWeb3();
    },

    initWeb3: async function () {
      // Modern dapp browsers...
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          // Request account access
          await window.ethereum.enable();
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(App.web3Provider);

      return App.initContract();
    },

    initContract: function () {
      $.getJSON('Buy.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var BuyArtifact = data;
        App.contracts.Buy = TruffleContract(BuyArtifact);
      
        // Set the provider for our contract
        App.contracts.Buy.setProvider(App.web3Provider);
        // Use our contract to retrieve and mark the adopted pets
        return App.markBought();
      });

      return App.bindEvents();
    },

    bindEvents: function () {
      $(document).on('click', '.btn-buy', App.handleBuy);
    },

    markBought: function () {
      var buyInstance;

      App.contracts.Buy.deployed().then(function(instance) {
        buyInstance = instance;
      
        return buyInstance.getClients.call();
      }).then(function(clients) {
      
      }).catch(function(err) {
        console.log(err.message);
      });
    },

    handleBuy: function (event) {
      event.preventDefault();

    var figureId = parseInt($(event.target).data('id'));

    var buyInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
    
      App.contracts.Buy.deployed().then(function(instance) {
        buyInstance = instance;    
        return buyInstance.buy(figureId, {from: account,value: web3.toWei(parseInt($('.panel-figure').eq(figureId).find('.figure-price').text()), 'ether')});
        
      }).then(function(result) {
        var figure = $('.panel-figure').eq(figureId);
      var units = parseInt(figure.find('.figure-units').text());
      figure.find('.figure-units').text(units - 1);

      if (units - 1 === 0) {
        figure.find('button').text('bought').attr('disabled', true);
      }
    }).catch(function(err) {
      console.log(err.message);
        return App.markBought();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
  };

  $(function () {
    $(window).load(function () {
      App.init();
    });
  });
