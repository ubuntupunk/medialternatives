
( function( blocks, element, editor ) {
    var el = element.createElement;
    var RichText = editor.RichText;

    blocks.registerBlockType( 'custom/adsense', {
        title: 'AdSenseFeed',
        icon: 'editor-break',
        category: 'common',

        edit: function( props ) {
            var attributes = props.attributes;

            function onChangeContent( newContent ) {
                props.setAttributes( { content: newContent } );
            }

	return el(
   	 'div',
   	 { className: props.className },
   	 el( RichText, {
       		 tagName: 'div',
       		 value: attributes.content,
       		 onChange: onChangeContent,
   	 } ),
   	 el( 'script', {
        dangerouslySetInnerHTML: {
            __html: '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1630578712653878"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-format="fluid"
     data-ad-layout-key="-5c+cv+44-et+57"
     data-ad-client="ca-pub-1630578712653878"
     data-ad-slot="9120443942"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>',
        },
    } )
);

      save: function( props ) {
            return el( RichText.Content, {
                tagName: 'div',
                value: props.attributes.content,
            } );
        },
    } );
} )(
    window.wp.blocks,
    window.wp.element,
    window.wp.editor
);
