package gmu.swe632;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(
    name = "InteractionDesignIteration2Servlet",
    urlPatterns = {"/interaction-design-iteration-2"}
)
public class InteractionDesignIteration2Servlet extends HttpServlet {

	private static final long serialVersionUID = -7159545361601340339L;

	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		String requestURI = request.getRequestURI();
		System.out.println("The request URI is: " + requestURI);
		
		RequestDispatcher view = request.getRequestDispatcher("/interaction-design-iteration-2.html");
		view.forward(request, response);
	}
	
	@Override
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		doGet(request, response);
	}
}
