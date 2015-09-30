# Carousel View

Sense alternatives are by default presented in a wrapping grid layout. It is possible to show the options in a carousel. The online tagging menu demo can be run with the carousel option (default) and without using the following links:

* Without carousel view: [http://api.idilia.com/TaggingMenuDemo?carousel=0](http://api.idilia.com/TaggingMenuDemo?carousel=0)
* With carousel view:  [http://api.idilia.com/TaggingMenuDemo](http://api.idilia.com/TaggingMenuDemo)

## Steps

To enable the carousel view option, the following steps should be taken:

1. Get owl-carousel

 If bower was used to install the tagging menu files, owl-carousel has been downloaded in the bower_components directory. Otherwise, clone the appropriate github repository:

 ```shell
git clone http://github.com/Idilia/OwlCarousel
```

2. Include owl-carousel

 ```html
 <!-- to be added before the idilia-tagging-menu stylesheets -->
 <link rel="stylesheet"  href="idilia-owl-carousel/owl-carousel/owl.carousel.css"/>
 <link rel="stylesheet" href="idilia-owl-carousel/owl-carousel/owl.theme.css"/>

 <!-- to be added before the idilia-tagging-menu javascript -->
 <script src="idilia-owl-carousel/owl-carousel/owl.carousel.js"></script>
 ```

This adds a toggle option to the senses view which chooses between grid and carousel view.
