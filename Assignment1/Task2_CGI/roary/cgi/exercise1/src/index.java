import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.FileSystems;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.io.IOException;
import java.io.BufferedReader;
import java.util.regex.Pattern;

// For the CGI implementation we use an HTML template with an JS variable which gets replaced with the actual
// mesages. Another javascript will then do the process of inserting the messages into the DOM on the client side.
public class index {
    // See https://stackoverflow.com/questions/1757065/java-splitting-a-comma-separated-string-but-ignoring-commas-in-quotes
    //private static final Pattern pattern = Pattern.compile(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
    // max number of messages to show
    private static final int MAX_MESSAGES = 50;
    
    public static void main(String[] args) {
        printHeaders();

        // Wrapper script should pass in path to data folder
        if (args.length == 0) {
            System.out.print("<h1>Internal error (missing data path)</h1>");
            return;
        }
        
        try {
            Path p = FileSystems.getDefault().getPath(args[0], "posts.csv");
            
            if (Files.notExists(p)) {
                System.out.print(INDEX_HTML);
                return;
            } else {
                Message[] buffer = new Message[MAX_MESSAGES];
                BufferedReader reader = Files.newBufferedReader(p);
                
                int[] result = readMessages(reader, buffer);
                reader.close();
                
                if (result == null) {
                    System.out.print("<h1>Internal error (invalid posts file)</h1>");
                    return;
                }
                
                printBody(buffer, result[0], result[1]);
            }
        } catch (IOException e) {
            System.out.print("<h1>Internal error (" + e.getMessage() + ")</h1>");
        }
    }

    // Prints respose headers and separator line
    private static void printHeaders() {
        System.out.print("Content-Type: text/html\r\n");
        System.out.print("\r\n");
    }
    
    // Places the read messages into a javascript variable in the HTML template and prints it
    private static void printBody(Message[] buffer, int index, int len) {
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        
        while (len-- > 0) {
            Message msg = buffer[index];
            index = (buffer.length + index - 1) % buffer.length;
            
            sb.append(first ? "{" : " ,{")
                .append("\"time\": ").append(msg.time).append(", ")
                .append("\"author\": \"").append(msg.author).append("\", ")
                .append("\"content\": \"").append(msg.content).append("\"")
                .append("}");
            first = false;
        }
        
        System.out.print(INDEX_HTML.replace("posts = []", "posts = [" + sb.toString() + "]"));
    }
    
    // Read the last MAX_MESSAGES from the csv file using the array as a ring buffer
    private static int[] readMessages(BufferedReader reader, Message[] buffer) throws IOException {
        int read = 0, index = 0;
        String line;
        
        while ((line = reader.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty())
                continue;
            
            // URL encoding ensures absence of commas
            String[] split = line.split(",");//pattern.split(line, -1);
            long time;
            
            if (split.length != 3)
                return null;
            
            try {
                time = Long.parseLong(split[0]);
            } catch (NumberFormatException nfe) {
                return null;
            }
            
            buffer[index] = new Message(time, split[1], split[2]);
            index = (index + 1) % buffer.length;
            read = Math.min(read + 1, buffer.length);
        }
        
        return new int[] {(buffer.length + index - 1) % buffer.length, read};
    }
    
    // Describes a message (time in milliseconds after unix epoch, author and content urlencoded !!!)
    // The storage format can break if author and content are not urlencoded
    private static final class Message {
        private long time;
        private String author;
        private String content;
        
        private Message(long time, String author, String content) {
            this.time = time;
            this.author = author;
            this.content = content;
        }
    }
    
    // We could read this from a file and this would obviously be better to change, read, maintain, etc.
    // But we would read the same file over and over again with no cache so we just store it as a string
    
    private static final String INDEX_HTML =
        "<html>"                                                                              +
        "   <head>"                                                                           +
        "       <title>Roary - Exercise 1 Task 2</title>"                                     +
        "       <meta charset=\"UTF-8\">"                                                     +
        "       <link rel=\"stylesheet\" href=\"/exercise1/static/css/index.css\">"           +
        "       <script async>const posts = [];</script>"                                     +
        "       <script src=\"/exercise1/static/js/set-messages.js\" defer></script>"         +
        "   </head>"                                                                          +
        "   <body>"                                                                           +
        "       <h1>Roary - Exercise 1 Task 2</h1>"                                           +
        "       <div id=\"new-post-container\">"                                              +
        "           <p id=\"new-post-header\">New Post</p>"                                   +
        "           <form action=\"./post.cgi\" method=\"POST\">"                             +
        "               <div class=\"form-entry\">"                                           +
        "                   <label for=\"name\">Name</label><br>"                             +
        "                   <input type=\"text\" id=\"name\" name=\"name\">"                  +
        "               </div><div class=\"form-entry\">"                                     +
        "                   <label for=\"message\">Message</label><br>"                       +
        "                   <textarea id=\"message\" name=\"message\" rows=\"4\"></textarea>" +
        "               </div><div class=\"form-entry\">"                                     +
        "                   <input type=\"submit\" value=\"Post Message\" id=\"submit-btn\">" +
        "               </div>"                                                               +
        "           </form>"                                                                  +
        "       </div>"                                                                       +
        "       <div id=\"posts-container\"></div>"                                           +
        "   <body>"                                                                           +
        "</html>";
}
